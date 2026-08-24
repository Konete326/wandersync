import Message from '../models/Message.js';
import { uploadImageBuffer } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCommunityMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const filter = {};
    if (req.query.room && req.query.room !== 'all') {
      filter.room = req.query.room;
    }
    if (req.query.search) {
      filter.text = new RegExp(req.query.search, 'i');
    }
    const messages = await Message.find(filter)
      .populate('user', 'name email avatar role')
      .sort({ createdAt: 1 })
      .limit(limit);
    const total = await Message.countDocuments(filter);
    return sendSuccess(res, 'Community messages retrieved', { messages, total });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createCommunityMessage = async (req, res) => {
  try {
    const { text, room, destinationTag } = req.body;
    if (!text || !text.trim()) {
      return sendError(res, 'Message text is required', 400);
    }
    let image = req.body.image || '';
    if (req.file) {
      const uploadResult = await uploadImageBuffer(req.file.buffer, 'wandersync/community');
      image = uploadResult.url;
    }
    const message = await Message.create({
      user: req.user._id,
      room: room || 'global-lounge',
      text: text.trim(),
      image,
      destinationTag: destinationTag || ''
    });
    const populated = await Message.findById(message._id).populate('user', 'name email avatar role');
    return sendSuccess(res, 'Message posted to community', populated, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const toggleLikeCommunityMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return sendError(res, 'Message not found', 404);
    const userId = req.user._id;
    const existsIndex = message.likes.indexOf(userId);
    if (existsIndex > -1) {
      message.likes.splice(existsIndex, 1);
    } else {
      message.likes.push(userId);
    }
    await message.save();
    return sendSuccess(res, 'Message like toggled', { likesCount: message.likes.length, isLiked: existsIndex === -1 });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const togglePinCommunityMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return sendError(res, 'Message not found', 404);
    message.pinned = !message.pinned;
    await message.save();
    return sendSuccess(res, `Message ${message.pinned ? 'pinned' : 'unpinned'}`, message);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteCommunityMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return sendError(res, 'Message not found', 404);
    const isAdmin = req.user.role === 'admin';
    const isAuthor = message.user.toString() === req.user._id.toString();
    if (!isAdmin && !isAuthor) {
      return sendError(res, 'Not authorized to delete this message', 403);
    }
    await message.deleteOne();
    return sendSuccess(res, 'Message removed from community');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
