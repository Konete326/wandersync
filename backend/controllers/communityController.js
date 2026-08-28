import Message from '../models/Message.js';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Notification from '../models/Notification.js';
import { uploadImageBuffer } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getCommunityMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const filter = {};
    if (req.query.room && req.query.room !== 'all') {
      filter.room = req.query.room;
    }
    if (req.query.search) {
      filter.text = new RegExp(req.query.search, 'i');
    }
    const messages = await Message.find(filter)
      .populate('user', 'name email avatar role createdAt preferences')
      .populate('trip', 'title destination coverImage')
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
    const total = await Message.countDocuments(filter);
    return sendSuccess(res, 'Community messages retrieved', { messages, total });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createCommunityMessage = async (req, res) => {
  try {
    const { text, room, destinationTag, tripId } = req.body;
    if ((!text || !text.trim()) && (!req.files?.length && !req.file && !req.body.image)) {
      return sendError(res, 'Message text or image attachment is required', 400);
    }
    const images = [];
    if (req.files && req.files.length > 0) {
      const filesToUpload = req.files.slice(0, 3);
      const uploadPromises = filesToUpload.map((f) => uploadImageBuffer(f.buffer, 'wandersync/community'));
      const results = await Promise.all(uploadPromises);
      results.forEach((r) => { if (r?.url) images.push(r.url); });
    } else if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer, 'wandersync/community');
      if (result?.url) images.push(result.url);
    } else if (req.body.image) {
      images.push(req.body.image);
    }

    // Determine badge and eligibility for trip / destination specific rooms
    let determinedBadge = 'member';
    const targetRoom = room || 'global-lounge';
    const userPrefs = req.user.preferences || {};
    const userLocation = `${userPrefs.homeCity || ''} ${userPrefs.homeCountry || ''} ${userPrefs.homeLocation || ''}`.toLowerCase();

    if (tripId) {
      const targetTrip = await Trip.findById(tripId);
      if (targetTrip) {
        const destCity = (targetTrip.destination?.city || '').toLowerCase();
        const destCountry = (targetTrip.destination?.country || '').toLowerCase();

        const isCreator = targetTrip.user.toString() === req.user._id.toString();
        const isCollaborator = targetTrip.collaborators?.some((c) => c.user?.toString() === req.user._id.toString() || c.email === req.user.email);
        const isResident = (destCity && userLocation.includes(destCity)) || (destCountry && userLocation.includes(destCountry));

        // Check if user has an itinerary/journey for this destination
        const hasTrip = await Trip.exists({
          user: req.user._id,
          $or: [
            { 'destination.city': new RegExp(destCity || '---', 'i') },
            { 'destination.country': new RegExp(destCountry || '---', 'i') }
          ]
        });

        if (isCreator) {
          determinedBadge = 'creator';
        } else if (isResident) {
          determinedBadge = 'resident';
        } else if (hasTrip || isCollaborator) {
          determinedBadge = 'traveler';
        }
      }
    } else if (targetRoom.startsWith('dest-') || destinationTag) {
      const tag = (destinationTag || targetRoom.replace('dest-', '')).toLowerCase();
      const isResident = tag && userLocation.includes(tag);
      const hasTrip = await Trip.exists({
        user: req.user._id,
        $or: [
          { 'destination.city': new RegExp(tag, 'i') },
          { 'destination.country': new RegExp(tag, 'i') }
        ]
      });

      if (isResident) {
        determinedBadge = 'resident';
      } else if (hasTrip) {
        determinedBadge = 'traveler';
      }
    }

    const message = await Message.create({
      user: req.user._id,
      room: targetRoom,
      text: text ? text.trim() : '',
      image: images[0] || '',
      images,
      destinationTag: destinationTag || '',
      authorBadge: determinedBadge,
      trip: tripId || null
    });
    const populated = await Message.findById(message._id)
      .populate('user', 'name email avatar role preferences')
      .populate('trip', 'title destination coverImage');

    // Parse and notify @mentions
    try {
      const mentionMatches = (text || '').match(/@([a-zA-Z0-9_ -]+?)(?=\s|$|[.,!?])/g);
      if (mentionMatches && mentionMatches.length > 0) {
        const rawNames = Array.from(new Set(mentionMatches.map((m) => m.substring(1).trim()).filter(Boolean)));
        const mentionedUsers = await User.find({
          name: { $in: rawNames.map((n) => new RegExp(`^${n}$`, 'i')) },
          _id: { $ne: req.user._id }
        }).select('_id name');

        for (const mUser of mentionedUsers) {
          await Notification.create({
            recipient: mUser._id,
            sender: req.user._id,
            type: 'mention',
            title: 'New Mention in Lounge',
            message: `${req.user.name} mentioned you in ${room || 'Global Lounge'}`,
            link: `/community?tab=chat&room=${encodeURIComponent(room || 'global-lounge')}`,
            metadata: {
              room: room || 'global-lounge',
              messageId: message._id.toString()
            }
          });
        }
      }
    } catch (notifErr) {
      console.warn('Mention notification error:', notifErr.message);
    }

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
