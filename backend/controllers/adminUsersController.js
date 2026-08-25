import User from '../models/User.js';
import Trip from '../models/Trip.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getAdminAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = {};
    if (req.query.search) {
      filter.$or = [{ name: new RegExp(req.query.search, 'i') }, { email: new RegExp(req.query.search, 'i') }];
    }
    if (req.query.role && req.query.role !== 'All') filter.role = req.query.role.toLowerCase();
    if (req.query.status && req.query.status !== 'All') filter.status = req.query.status.toLowerCase();
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const userIds = users.map((u) => u._id);
    const tripCounts = await Trip.aggregate([{ $match: { user: { $in: userIds } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]);
    const tripCountMap = {};
    tripCounts.forEach((tc) => { tripCountMap[tc._id.toString()] = tc.count; });
    const enrichedUsers = users.map((u) => ({ ...u, tripsCount: tripCountMap[u._id.toString()] || 0 }));
    return sendSuccess(res, 'Admin users fetched', { users: enrichedUsers, total, page, pages: Math.ceil(total / limit) || 1, limit });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return sendError(res, 'Name, email, and temporary password are required', 400);
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return sendError(res, 'User with this email already exists', 400);
    const user = await User.create({
      name: name.trim(), email: email.toLowerCase().trim(), password,
      role: role === 'admin' ? 'admin' : 'user', status: 'active'
    });
    const sanitized = await User.findById(user._id).select('-password');
    return sendSuccess(res, 'Traveler user account created successfully', sanitized, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateAdminUserDetails = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role && ['user', 'admin'].includes(role)) {
      if (req.user._id.toString() === user._id.toString() && role !== 'admin') {
        return sendError(res, 'Cannot demote your own admin account', 400);
      }
      user.role = role;
    }
    if (status && ['active', 'banned', 'suspended'].includes(status)) {
      if (req.user._id.toString() === user._id.toString()) return sendError(res, 'Cannot modify your own account status', 400);
      user.status = status;
    }
    await user.save();
    const updated = await User.findById(user._id).select('-password');
    return sendSuccess(res, 'User profile updated successfully', updated);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateUserRoleAdmin = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return sendError(res, 'Invalid role', 400);
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (req.user._id.toString() === user._id.toString() && role !== 'admin') return sendError(res, 'Cannot demote your own admin account', 400);
    user.role = role;
    await user.save();
    return sendSuccess(res, `User role updated to ${role}`, user);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const toggleUserStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'banned', 'suspended'].includes(status)) return sendError(res, 'Invalid status', 400);
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (req.user._id.toString() === user._id.toString()) return sendError(res, 'Cannot ban or suspend your own account', 400);
    user.status = status;
    await user.save();
    return sendSuccess(res, `User account marked as ${status}`, user);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    if (req.user._id.toString() === user._id.toString()) return sendError(res, 'Cannot delete your own admin account', 400);
    await Trip.deleteMany({ user: user._id });
    await user.deleteOne();
    return sendSuccess(res, 'User and associated data removed');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
