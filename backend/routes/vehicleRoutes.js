import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.post('/', protect, adminOnly, uploadSingle('image'), createVehicle);
router.put('/:id', protect, adminOnly, uploadSingle('image'), updateVehicle);
router.delete('/:id', protect, adminOnly, deleteVehicle);

export default router;
