import express from 'express';
import {
  getSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot
} from '../controllers/spotController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getSpots);
router.get('/:id', getSpotById);
router.post('/', protect, adminOnly, uploadSingle('image'), createSpot);
router.put('/:id', protect, adminOnly, uploadSingle('image'), updateSpot);
router.delete('/:id', protect, adminOnly, deleteSpot);

export default router;
