import User from '../models/User.js';
import Friendship from '../models/Friendship.js';
import FriendGroup from '../models/FriendGroup.js';
import DirectMessage from '../models/DirectMessage.js';
import GroupMessage from '../models/GroupMessage.js';
import Notification from '../models/Notification.js';
import Trip from '../models/Trip.js';
import { uploadImageBuffer } from '../services/cloudinaryService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Search users by profile name or email and return friendship status
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return sendSuccess(res, 'No search query provided', []);
    }

    const currentUserId = req.user._id;
    const searchRegex = new RegExp(query.trim(), 'i');

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [{ name: searchRegex }, { email: searchRegex }],
      status: { $ne: 'banned' }
    })
      .select('name email avatar role createdAt')
      .limit(20)
      .lean();

    const userIds = users.map((u) => u._id);

    const existingFriendships = await Friendship.find({
      $or: [
        { requester: currentUserId, recipient: { $in: userIds } },
        { recipient: currentUserId, requester: { $in: userIds } }
      ]
    }).lean();

    const usersWithStatus = users.map((u) => {
      const friendship = existingFriendships.find(
        (f) =>
          (f.requester.toString() === currentUserId.toString() && f.recipient.toString() === u._id.toString()) ||
          (f.recipient.toString() === currentUserId.toString() && f.requester.toString() === u._id.toString())
      );

      let status = 'none';
      let requestId = null;

      if (friendship) {
        if (friendship.status === 'accepted') {
          status = 'friends';
        } else if (friendship.status === 'pending') {
          if (friendship.requester.toString() === currentUserId.toString()) {
            status = 'pending_sent';
          } else {
            status = 'pending_received';
            requestId = friendship._id;
          }
        }
      }

      return {
        ...u,
        friendshipStatus: status,
        friendshipId: friendship?._id || null,
        requestId
      };
    });

    return sendSuccess(res, 'Users found', usersWithStatus);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return sendError(res, 'Recipient ID is required', 400);
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return sendError(res, 'You cannot send a friend request to yourself', 400);
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return sendError(res, 'Recipient user not found', 404);
    }

    let friendship = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: recipientId },
        { requester: recipientId, recipient: currentUserId }
      ]
    });

    if (friendship) {
      if (friendship.status === 'accepted') {
        return sendError(res, 'You are already friends with this user', 400);
      }
      if (friendship.status === 'pending') {
        return sendError(res, 'A friend request is already pending', 400);
      }
      friendship.requester = currentUserId;
      friendship.recipient = recipientId;
      friendship.status = 'pending';
      await friendship.save();
    } else {
      friendship = await Friendship.create({
        requester: currentUserId,
        recipient: recipientId,
        status: 'pending'
      });
    }

    return sendSuccess(res, 'Friend request sent successfully', friendship, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Accept or Reject a friend request
export const respondFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const currentUserId = req.user._id;

    if (!['accept', 'reject'].includes(action)) {
      return sendError(res, 'Action must be "accept" or "reject"', 400);
    }

    const friendship = await Friendship.findById(id);
    if (!friendship) {
      return sendError(res, 'Friend request not found', 404);
    }

    if (friendship.recipient.toString() !== currentUserId.toString()) {
      return sendError(res, 'You are not authorized to respond to this request', 403);
    }

    friendship.status = action === 'accept' ? 'accepted' : 'rejected';
    await friendship.save();

    const populated = await Friendship.findById(id)
      .populate('requester', 'name email avatar')
      .populate('recipient', 'name email avatar');

    return sendSuccess(
      res,
      `Friend request ${action === 'accept' ? 'accepted' : 'declined'} successfully`,
      populated
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Get list of accepted friends
export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [{ requester: currentUserId }, { recipient: currentUserId }]
    })
      .populate('requester', 'name email avatar role')
      .populate('recipient', 'name email avatar role')
      .lean();

    const friendsList = await Promise.all(
      friendships.map(async (f) => {
        const isRequester = f.requester._id.toString() === currentUserId.toString();
        const friend = isRequester ? f.recipient : f.requester;

        const lastMessage = await DirectMessage.findOne({
          $or: [
            { sender: currentUserId, recipient: friend._id },
            { sender: friend._id, recipient: currentUserId }
          ]
        })
          .sort({ createdAt: -1 })
          .select('text sharedTrip read sender createdAt')
          .lean();

        const unreadCount = await DirectMessage.countDocuments({
          sender: friend._id,
          recipient: currentUserId,
          read: false
        });

        return {
          friendshipId: f._id,
          friend,
          lastMessage,
          unreadCount,
          connectedSince: f.updatedAt
        };
      })
    );

    return sendSuccess(res, 'Friends list retrieved', friendsList);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Get pending incoming & outgoing friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const incoming = await Friendship.find({
      recipient: currentUserId,
      status: 'pending'
    })
      .populate('requester', 'name email avatar role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const outgoing = await Friendship.find({
      requester: currentUserId,
      status: 'pending'
    })
      .populate('recipient', 'name email avatar role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 'Friend requests retrieved', { incoming, outgoing });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Remove a friend or cancel a request
export const removeFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const friendship = await Friendship.findOne({
      _id: id,
      $or: [{ requester: currentUserId }, { recipient: currentUserId }]
    });

    if (!friendship) {
      return sendError(res, 'Friend connection not found', 404);
    }

    await friendship.deleteOne();
    return sendSuccess(res, 'Friend connection removed successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Get 1-on-1 direct messages with a friend
export const getDirectMessages = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    const isFriend = await Friendship.findOne({
      status: 'accepted',
      $or: [
        { requester: currentUserId, recipient: friendId },
        { requester: friendId, recipient: currentUserId }
      ]
    });

    if (!isFriend) {
      return sendError(res, 'You can only chat with accepted friends', 403);
    }

    const messages = await DirectMessage.find({
      $or: [
        { sender: currentUserId, recipient: friendId },
        { sender: friendId, recipient: currentUserId }
      ]
    })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate({
        path: 'sharedTrip',
        select: 'title destination overview budgetLevel estimatedTotalCost currency days highlights coverImage shareSlug travelerPartyType travelerCount collaborators'
      })
      .sort({ createdAt: 1 })
      .limit(150)
      .lean();

    await DirectMessage.updateMany(
      { sender: friendId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    return sendSuccess(res, 'Direct messages retrieved', messages);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Send a direct message (text, images, or shared trip)
export const sendDirectMessage = async (req, res) => {
  try {
    const { friendId } = req.params;
    const { text, sharedTripId } = req.body;
    const currentUserId = req.user._id;

    const isFriend = await Friendship.findOne({
      status: 'accepted',
      $or: [
        { requester: currentUserId, recipient: friendId },
        { requester: friendId, recipient: currentUserId }
      ]
    });

    if (!isFriend) {
      return sendError(res, 'You can only message accepted friends', 403);
    }

    if (!text?.trim() && !sharedTripId && !req.files?.length && !req.file && !req.body.image) {
      return sendError(res, 'Message text, attachment, or trip is required', 400);
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      const filesToUpload = req.files.slice(0, 3);
      const uploadPromises = filesToUpload.map((f) => uploadImageBuffer(f.buffer, 'wandersync/chat'));
      const results = await Promise.all(uploadPromises);
      results.forEach((r) => { if (r?.url) images.push(r.url); });
    } else if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer, 'wandersync/chat');
      if (result?.url) images.push(result.url);
    } else if (req.body.image) {
      images.push(req.body.image);
    }

    let trip = null;
    if (sharedTripId) {
      trip = await Trip.findById(sharedTripId);
      if (!trip) {
        return sendError(res, 'Shared trip not found', 404);
      }
    }

    const message = await DirectMessage.create({
      sender: currentUserId,
      recipient: friendId,
      text: text ? text.trim() : (trip ? `Check out my itinerary for ${trip.destination?.city || trip.title}!` : ''),
      sharedTrip: trip ? trip._id : null,
      images,
      read: false
    });

    const populated = await DirectMessage.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .populate({
        path: 'sharedTrip',
        select: 'title destination overview budgetLevel estimatedTotalCost currency days highlights coverImage shareSlug travelerPartyType travelerCount collaborators'
      });

    return sendSuccess(res, 'Direct message sent', populated, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ==========================================
// CUSTOM FRIEND GROUPS & WHATSAPP-STYLE CHAT
// ==========================================

// Create a new friend group
export const createFriendGroup = async (req, res) => {
  try {
    const { name, description, icon, memberIds } = req.body;
    const currentUserId = req.user._id;

    if (!name || !name.trim()) {
      return sendError(res, 'Group name is required', 400);
    }

    const validMemberIds = Array.isArray(memberIds) ? memberIds.filter(id => id.toString() !== currentUserId.toString()) : [];
    
    // Add creator as admin
    const members = [
      { user: currentUserId, role: 'admin', joinedAt: new Date() }
    ];

    validMemberIds.forEach(id => {
      members.push({ user: id, role: 'member', joinedAt: new Date() });
    });

    const group = await FriendGroup.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      icon: icon || 'Users',
      creator: currentUserId,
      members,
      lastMessage: {
        text: `Group "${name.trim()}" created`,
        sender: currentUserId,
        createdAt: new Date()
      }
    });

    const populated = await FriendGroup.findById(group._id)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar role');

    return sendSuccess(res, 'Friend group created successfully', populated, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Get all friend groups the user belongs to
export const getUserFriendGroups = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const groups = await FriendGroup.find({
      'members.user': currentUserId
    })
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 })
      .lean();

    return sendSuccess(res, 'Friend groups retrieved', groups);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Get messages for a custom friend group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user._id;

    const group = await FriendGroup.findOne({
      _id: groupId,
      'members.user': currentUserId
    });

    if (!group) {
      return sendError(res, 'Group not found or you are not a member', 403);
    }

    const messages = await GroupMessage.find({ group: groupId })
      .populate('sender', 'name email avatar role')
      .populate({
        path: 'sharedTrip',
        select: 'title destination overview budgetLevel estimatedTotalCost currency days highlights coverImage shareSlug travelerPartyType travelerCount collaborators'
      })
      .sort({ createdAt: 1 })
      .limit(150)
      .lean();

    return sendSuccess(res, 'Group messages retrieved', messages);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Send a message or share a trip inside a friend group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, sharedTripId } = req.body;
    const currentUserId = req.user._id;

    const group = await FriendGroup.findOne({
      _id: groupId,
      'members.user': currentUserId
    });

    if (!group) {
      return sendError(res, 'Group not found or you are not a member', 403);
    }

    if (!text?.trim() && !sharedTripId && !req.files?.length && !req.file && !req.body.image) {
      return sendError(res, 'Message text, attachment, or trip is required', 400);
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      const filesToUpload = req.files.slice(0, 3);
      const uploadPromises = filesToUpload.map((f) => uploadImageBuffer(f.buffer, 'wandersync/chat'));
      const results = await Promise.all(uploadPromises);
      results.forEach((r) => { if (r?.url) images.push(r.url); });
    } else if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer, 'wandersync/chat');
      if (result?.url) images.push(result.url);
    } else if (req.body.image) {
      images.push(req.body.image);
    }

    let trip = null;
    if (sharedTripId) {
      trip = await Trip.findById(sharedTripId);
      if (!trip) {
        return sendError(res, 'Shared trip not found', 404);
      }
    }

    const message = await GroupMessage.create({
      group: groupId,
      sender: currentUserId,
      text: text ? text.trim() : (trip ? `✈️ Shared an itinerary: ${trip.title}` : ''),
      sharedTrip: trip ? trip._id : null,
      images
    });

    // Update group's last message
    group.lastMessage = {
      text: message.text || 'Shared attachment',
      sender: currentUserId,
      sharedTrip: trip ? trip._id : null,
      createdAt: new Date()
    };
    await group.save();

    const populated = await GroupMessage.findById(message._id)
      .populate('sender', 'name email avatar role')
      .populate({
        path: 'sharedTrip',
        select: 'title destination overview budgetLevel estimatedTotalCost currency days highlights coverImage shareSlug travelerPartyType travelerCount collaborators'
      });

    // Parse and notify @mentions in Group Chat
    try {
      const mentionMatches = (text || '').match(/@([a-zA-Z0-9_ -]+?)(?=\s|$|[.,!?])/g);
      if (mentionMatches && mentionMatches.length > 0) {
        const rawNames = Array.from(new Set(mentionMatches.map((m) => m.substring(1).trim()).filter(Boolean)));
        const memberUserIds = group.members.map((m) => m.user.toString());
        const mentionedUsers = await User.find({
          _id: { $in: memberUserIds, $ne: currentUserId },
          name: { $in: rawNames.map((n) => new RegExp(`^${n}$`, 'i')) }
        }).select('_id name');

        for (const mUser of mentionedUsers) {
          await Notification.create({
            recipient: mUser._id,
            sender: currentUserId,
            type: 'mention',
            title: `Mention in ${group.name}`,
            message: `${req.user.name} mentioned you in "${group.name}"`,
            link: `/community?tab=friends_chat&groupId=${groupId}`,
            metadata: {
              groupId: group._id,
              messageId: message._id.toString()
            }
          });
        }
      }
    } catch (notifErr) {
      console.warn('Group mention error:', notifErr.message);
    }

    return sendSuccess(res, 'Group message sent', populated, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// =========================================================================
// ACCEPT / JOIN SHARED TRIP (Dynamic Solo -> Duo -> Triple Squad Conversion)
// =========================================================================
export const joinSharedTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const currentUser = req.user;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return sendError(res, 'Trip itinerary not found', 404);
    }

    const userEmail = currentUser.email.toLowerCase();
    const isOwner = trip.user.toString() === currentUser._id.toString();
    const alreadyCollaborator = trip.collaborators?.some(
      (c) =>
        (c.user && c.user.toString() === currentUser._id.toString()) ||
        (c.email && c.email.toLowerCase() === userEmail)
    );

    if (isOwner || alreadyCollaborator) {
      return sendSuccess(res, 'You are already a member of this trip itinerary', trip);
    }

    // Add user to collaborators
    trip.collaborators.push({
      user: currentUser._id,
      email: userEmail,
      role: 'editor',
      addedAt: new Date()
    });

    // Recalculate total party count (Owner + Collaborators)
    const totalTravelers = 1 + trip.collaborators.length;
    trip.travelerCount = totalTravelers;

    if (totalTravelers === 1) {
      trip.travelerPartyType = 'Solo Explorer';
    } else if (totalTravelers === 2) {
      trip.travelerPartyType = 'Duo Expedition (2 Travelers)';
    } else if (totalTravelers === 3) {
      trip.travelerPartyType = 'Triple Squad (3 Travelers)';
    } else {
      trip.travelerPartyType = `Travel Tribe (${totalTravelers} Travelers)`;
    }

    await trip.save();

    const populatedTrip = await Trip.findById(tripId)
      .populate('user', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');

    return sendSuccess(
      res,
      `Congratulations! You joined the trip. Upgraded to ${trip.travelerPartyType}!`,
      populatedTrip
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Get User Notifications (Unread Messages, Mentions & Incoming Friend Requests)
export const getUserNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Unread direct messages
    const unreadMessages = await DirectMessage.find({
      recipient: currentUserId,
      read: false
    })
      .populate('sender', 'name email avatar')
      .populate('sharedTrip', 'title destination')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 2. Incoming pending friend requests
    const incomingRequests = await Friendship.find({
      recipient: currentUserId,
      status: 'pending'
    })
      .populate('requester', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 3. Mentions & Alerts from Notification collection
    const mentionNotifications = await Notification.find({
      recipient: currentUserId,
      read: false
    })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const totalUnreadCount = unreadMessages.length + incomingRequests.length + mentionNotifications.length;

    return sendSuccess(res, 'Notifications retrieved', {
      totalUnreadCount,
      unreadMessages,
      incomingRequests,
      mentionNotifications
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// Mark a specific notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const notif = await Notification.findOneAndUpdate(
      { _id: id, recipient: currentUserId },
      { $set: { read: true } },
      { new: true }
    );

    return sendSuccess(res, 'Notification marked as read', notif);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

