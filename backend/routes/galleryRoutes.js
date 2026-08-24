import express from 'express';
import {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem
} from '../controllers/galleryController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getGalleryItems);
router.post('/', protect, adminOnly, upload.single('image'), createGalleryItem);
router.delete('/:id', protect, adminOnly, deleteGalleryItem);

export default router;
