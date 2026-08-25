import express from 'express';
import {
  generateItinerary,
  refineItinerary,
  chatAssistant,
  autofillDestination,
  autofillEntity
} from '../controllers/aiController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-itinerary', protect, generateItinerary);
router.post('/chat-refine', protect, refineItinerary);
router.post('/chat', protect, chatAssistant);
router.post('/autofill-destination', protect, adminOnly, autofillDestination);
router.post('/autofill-entity', protect, adminOnly, autofillEntity);

export default router;
