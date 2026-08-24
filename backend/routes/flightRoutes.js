import express from 'express';
import {
  getFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight
} from '../controllers/flightController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getFlights);
router.get('/:id', getFlightById);
router.post('/', protect, adminOnly, uploadSingle('image'), createFlight);
router.put('/:id', protect, adminOnly, uploadSingle('image'), updateFlight);
router.delete('/:id', protect, adminOnly, deleteFlight);

export default router;
