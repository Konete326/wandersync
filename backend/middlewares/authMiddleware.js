import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return sendError(res, 'User not found', 401);
      }
      return next();
    } catch (error) {
      return sendError(res, 'Not authorized, token failed', 401);
    }
  }
  return sendError(res, 'Not authorized, no token provided', 401);
};
