import express from 'express';
import {
  getUserTrips,
  getTripById,
  getSharedTrip,
  createTrip,
  updateTrip,
  deleteTrip
} from '../controllers/tripController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/share/:shareSlug', getSharedTrip);
router.get('/', protect, getUserTrips);
router.post('/', protect, createTrip);
router.get('/:id', protect, getTripById);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

export default router;
