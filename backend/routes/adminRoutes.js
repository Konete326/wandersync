import express from 'express';
import {
  getAdminStats,
  getAdminRecentTrips,
  getAdminUsers,
  getAdminActivityFeed,
  getAdminNotifications
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/trips', getAdminRecentTrips);
router.get('/users', getAdminUsers);
router.get('/activity', getAdminActivityFeed);
router.get('/notifications', getAdminNotifications);

export default router;
