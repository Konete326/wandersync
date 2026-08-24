import express from 'express';
import {
  getTripExpenses,
  getPlatformExpenses,
  createPlatformExpense,
  updatePlatformExpense,
  addExpense,
  deleteExpense
} from '../controllers/expenseController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/platform', protect, adminOnly, getPlatformExpenses);
router.post('/platform', protect, adminOnly, createPlatformExpense);
router.put('/platform/:id', protect, adminOnly, updatePlatformExpense);
router.get('/trip/:tripId', protect, getTripExpenses);
router.post('/', protect, addExpense);
router.delete('/:id', protect, deleteExpense);

export default router;
