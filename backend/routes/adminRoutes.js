import express from 'express';
import {
  getAdminStats,
  getAdminRecentTrips,
  getAdminUsers,
  getAdminActivityFeed,
  getAdminNotifications
} from '../controllers/adminController.js';
import {
  getAdminAllTrips,
  toggleTripFeaturedAdmin,
  toggleTripVisibilityAdmin,
  deleteTripAdmin
} from '../controllers/adminTripsController.js';
import {
  getAdminAllUsers,
  updateUserRoleAdmin,
  toggleUserStatusAdmin,
  deleteUserAdmin
} from '../controllers/adminUsersController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/trips', getAdminRecentTrips);
router.get('/users', getAdminUsers);
router.get('/activity', getAdminActivityFeed);
router.get('/notifications', getAdminNotifications);

router.get('/trips/all', getAdminAllTrips);
router.patch('/trips/:id/feature', toggleTripFeaturedAdmin);
router.patch('/trips/:id/visibility', toggleTripVisibilityAdmin);
router.delete('/trips/:id', deleteTripAdmin);

router.get('/users/all', getAdminAllUsers);
router.patch('/users/:id/role', updateUserRoleAdmin);
router.patch('/users/:id/status', toggleUserStatusAdmin);
router.delete('/users/:id', deleteUserAdmin);

export default router;
