import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
} from '../controllers/hotelController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', protect, adminOnly, uploadSingle('image'), createHotel);
router.put('/:id', protect, adminOnly, uploadSingle('image'), updateHotel);
router.delete('/:id', protect, adminOnly, deleteHotel);

export default router;
