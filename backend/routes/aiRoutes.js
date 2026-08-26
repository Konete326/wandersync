import express from 'express';
import {
  generateItinerary,
  refineItinerary,
  chatAssistant,
  autofillDestination,
  autofillEntity
} from '../controllers/aiController.js';
import { protect, optionalProtect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-itinerary', optionalProtect, generateItinerary);
router.post('/chat-refine', optionalProtect, refineItinerary);
router.post('/chat', optionalProtect, chatAssistant);
router.post('/autofill-destination', optionalProtect, autofillDestination);
router.post('/autofill-entity', optionalProtect, autofillEntity);

export default router;
