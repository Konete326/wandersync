import express from 'express';
import {
  generateItinerary,
  refineItinerary,
  chatAssistant,
  autofillDestination
} from '../controllers/aiController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-itinerary', protect, generateItinerary);
router.post('/chat-refine', protect, refineItinerary);
router.post('/chat', protect, chatAssistant);
router.post('/autofill-destination', protect, adminOnly, autofillDestination);

export default router;
