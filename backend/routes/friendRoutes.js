import express from 'express';
import multer from 'multer';
import {
  searchUsers,
  sendFriendRequest,
  respondFriendRequest,
  getFriends,
  getFriendRequests,
  removeFriend,
  getDirectMessages,
  sendDirectMessage,
  createFriendGroup,
  getUserFriendGroups,
  getGroupMessages,
  sendGroupMessage,
  joinSharedTrip,
  getUserNotifications,
  markNotificationRead
} from '../controllers/friendController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Protect all friend and DM routes
router.use(protect);

router.get('/notifications', getUserNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/search', searchUsers);
router.post('/request', sendFriendRequest);
router.put('/request/:id/respond', respondFriendRequest);
router.get('/', getFriends);
router.get('/requests', getFriendRequests);
router.delete('/:id', removeFriend);

router.get('/messages/:friendId', getDirectMessages);
router.post('/messages/:friendId', upload.array('images', 3), sendDirectMessage);

// Custom Friend Groups & WhatsApp-style Chat
router.post('/groups', createFriendGroup);
router.get('/groups', getUserFriendGroups);
router.get('/groups/:groupId/messages', getGroupMessages);
router.post('/groups/:groupId/messages', upload.array('images', 3), sendGroupMessage);

// Join Trip Invitation (Solo -> Duo -> Triple Squad)
router.post('/trips/:tripId/join', joinSharedTrip);

export default router;
