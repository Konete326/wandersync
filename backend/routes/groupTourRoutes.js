import express from 'express';
import {
  getGroupTours,
  getGroupTourById,
  createGroupTour,
  updateGroupTour,
  deleteGroupTour
} from '../controllers/groupTourController.js';
import {
  createPOSBooking,
  getTourBookings
} from '../controllers/posController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getGroupTours);
router.get('/bookings', protect, adminOnly, getTourBookings);
router.get('/:id', getGroupTourById);
router.post('/', protect, adminOnly, uploadSingle('image'), createGroupTour);
router.put('/:id', protect, adminOnly, uploadSingle('image'), updateGroupTour);
router.delete('/:id', protect, adminOnly, deleteGroupTour);
router.post('/pos/book', protect, adminOnly, createPOSBooking);

export default router;
