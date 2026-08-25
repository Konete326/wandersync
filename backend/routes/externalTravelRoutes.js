import express from 'express';
import {
  getPlaces,
  getHotels,
  getTransport,
  getEvents,
  getIntegrationStatus
} from '../controllers/externalTravelController.js';

const router = express.Router();

router.get('/places', getPlaces);
router.get('/hotels', getHotels);
router.get('/transport', getTransport);
router.get('/events', getEvents);
router.get('/status', getIntegrationStatus);

export default router;
