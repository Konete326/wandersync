import express from 'express';
import { generateItinerary, refineItinerary } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-itinerary', protect, generateItinerary);
router.post('/chat-refine', protect, refineItinerary);

export default router;
