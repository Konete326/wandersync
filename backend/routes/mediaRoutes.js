import express from 'express';
import { uploadMedia, removeMedia } from '../controllers/mediaController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('image'), uploadMedia);
router.delete('/:publicId', protect, removeMedia);

export default router;
