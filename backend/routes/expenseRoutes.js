import express from 'express';
import { getTripExpenses, addExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/trip/:tripId', protect, getTripExpenses);
router.post('/', protect, addExpense);
router.delete('/:id', protect, deleteExpense);

export default router;
