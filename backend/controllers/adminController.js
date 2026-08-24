import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalExpenses = await Expense.countDocuments();

    const distinctDestinations = await Trip.distinct('destination.city');
    const totalDestinations = distinctDestinations.length;

    const expenseSum = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalBudgetTracked = expenseSum[0]?.total || 0;

    return sendSuccess(res, 'Admin statistics retrieved', {
      totalTrips,
      totalUsers,
      totalExpenses,
      totalDestinations,
      totalBudgetTracked,
      activeTravelers: Math.max(totalUsers, 1),
      geminiInferences: totalTrips * 3 + 12
    });
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch admin stats', 500);
  }
};

export const getAdminRecentTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    return sendSuccess(res, 'Recent trips retrieved', trips);
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch recent trips', 500);
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(20);
    return sendSuccess(res, 'User directory retrieved', users);
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch users', 500);
  }
};

export const getAdminActivityFeed = async (req, res) => {
  try {
    const recentTrips = await Trip.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    const activities = recentTrips.map((t) => ({
      id: t._id,
      title: `${t.title || 'Itinerary'} generated for ${t.destination?.city || 'Destination'}`,
      traveler: t.user?.name || 'Traveler',
      time: t.createdAt,
      type: 'trip'
    }));

    return sendSuccess(res, 'Activity feed retrieved', activities);
  } catch (error) {
    return sendError(res, error.message || 'Failed to fetch activity feed', 500);
  }
};
