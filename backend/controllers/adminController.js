import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Gallery from '../models/Gallery.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalExpenses = await Expense.countDocuments({ isPlatformExpense: true });
    const totalDestinations = await Gallery.countDocuments();
    const expenseSum = await Expense.aggregate([
      { $match: { isPlatformExpense: true, status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalBudgetTracked = expenseSum[0]?.total || 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const dailyRaw = await Trip.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyGenerations = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const match = dailyRaw.find((r) => r._id === dateStr);
      return { day: dayNames[d.getDay()], date: dateStr, count: match ? match.count : 0 };
    });
    return sendSuccess(res, 'Admin statistics retrieved', {
      totalTrips, totalUsers, totalExpenses, totalDestinations, totalBudgetTracked,
      activeTravelers: totalUsers, geminiInferences: totalTrips * 4, dailyGenerations
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminRecentTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate('user', 'name email avatar').sort({ createdAt: -1 }).limit(10);
    return sendSuccess(res, 'Recent trips retrieved', trips);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(20);
    return sendSuccess(res, 'User directory retrieved', users);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminActivityFeed = async (req, res) => {
  try {
    const recentTrips = await Trip.find().populate('user', 'name').sort({ createdAt: -1 }).limit(6);
    const activities = recentTrips.map((t) => ({
      id: t._id,
      title: `${t.title || 'Itinerary'} created for ${t.destination?.city || 'Destination'}`,
      traveler: t.user?.name || 'Traveler',
      time: t.createdAt,
      type: 'trip'
    }));
    return sendSuccess(res, 'Activity feed retrieved', activities);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getAdminNotifications = async (req, res) => {
  try {
    const trips = await Trip.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5);
    const users = await User.find().sort({ createdAt: -1 }).limit(3);
    const destinations = await Gallery.find().sort({ createdAt: -1 }).limit(3);
    const list = [];
    trips.forEach((t) => {
      list.push({ id: `trip-${t._id}`, title: `AI Itinerary Generated: ${t.destination?.city || 'Trip'}`, message: `${t.user?.name || 'Traveler'} generated a ${t.durationDays || 3}-day itinerary.`, type: 'trip', time: new Date(t.createdAt).toLocaleDateString(), read: false });
    });
    users.forEach((u) => {
      list.push({ id: `user-${u._id}`, title: `Traveler Registered: ${u.name}`, message: `Account email: ${u.email}. Role: ${u.role}.`, type: 'security', time: new Date(u.createdAt).toLocaleDateString(), read: true });
    });
    destinations.forEach((d) => {
      list.push({ id: `dest-${d._id}`, title: `Destination Published: ${d.title}`, message: `Verified spot in ${d.city}, ${d.country} added.`, type: 'ai', time: new Date(d.createdAt).toLocaleDateString(), read: true });
    });
    return sendSuccess(res, 'Admin notifications retrieved', list);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
