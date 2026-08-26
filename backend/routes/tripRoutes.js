import express from 'express';
import {
  getUserTrips,
  getTripById,
  getPublicTrips,
  getSharedTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  addCollaborator,
  removeCollaborator,
  getCollaborators
} from '../controllers/tripController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/public', getPublicTrips);
router.get('/share/:shareSlug', getSharedTrip);
router.get('/', protect, getUserTrips);
router.post('/', protect, createTrip);
router.get('/:id', protect, getTripById);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);

router.get('/:id/collaborators', protect, getCollaborators);
router.post('/:id/collaborators', protect, addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', protect, removeCollaborator);

export default router;
