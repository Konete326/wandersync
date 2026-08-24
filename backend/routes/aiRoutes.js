import express from 'express';
import { generateItinerary, refineItinerary, chatAssistant } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-itinerary', protect, generateItinerary);
router.post('/chat-refine', protect, refineItinerary);
router.post('/chat', protect, chatAssistant);

export default router;
