import express from 'express';
import {
  getCommunityMessages,
  createCommunityMessage,
  toggleLikeCommunityMessage,
  togglePinCommunityMessage,
  deleteCommunityMessage
} from '../controllers/communityController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getCommunityMessages);
router.post('/', protect, uploadSingle('image'), createCommunityMessage);
router.patch('/:id/like', protect, toggleLikeCommunityMessage);
router.patch('/:id/pin', protect, adminOnly, togglePinCommunityMessage);
router.delete('/:id', protect, deleteCommunityMessage);

export default router;
