import express from 'express';
import {
  getCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry
} from '../controllers/countryController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getCountries);
router.get('/:id', getCountryById);
router.post('/', protect, adminOnly, uploadSingle('image'), createCountry);
router.put('/:id', protect, adminOnly, uploadSingle('image'), updateCountry);
router.delete('/:id', protect, adminOnly, deleteCountry);

export default router;
