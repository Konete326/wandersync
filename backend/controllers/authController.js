import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, travelStyle, currency } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Please provide all required fields', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return sendError(res, 'User with this email already exists', 400);
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      preferences: {
        travelStyle: travelStyle || 'moderate',
        currency: currency || 'USD'
      }
    });

    const token = generateToken(user._id);
    return sendSuccess(res, 'Registration successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences
      },
      token
    }, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);
    return sendSuccess(res, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences
      },
      token
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getProfile = async (req, res) => {
  return sendSuccess(res, 'Profile fetched successfully', req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const { name, travelStyle, currency, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (name) user.name = name.trim();
    if (travelStyle) user.preferences.travelStyle = travelStyle;
    if (currency) user.preferences.currency = currency;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();
    return sendSuccess(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
