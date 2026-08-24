import Expense from '../models/Expense.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getTripExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ trip: req.params.tripId, user: req.user._id }).sort({ date: -1 });
    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    const categoryBreakdown = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    return sendSuccess(res, 'Expenses fetched successfully', {
      expenses,
      totalAmount,
      categoryBreakdown
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const addExpense = async (req, res) => {
  try {
    const { trip, title, amount, category, date, receiptImage } = req.body;
    if (!trip || !title || !amount) {
      return sendError(res, 'Trip ID, title, and amount are required', 400);
    }

    const expense = await Expense.create({
      trip,
      user: req.user._id,
      title,
      amount: Number(amount),
      category: category || 'Other',
      date: date || Date.now(),
      receiptImage: receiptImage || ''
    });

    return sendSuccess(res, 'Expense logged successfully', expense, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return sendError(res, 'Expense not found', 404);
    }
    if (expense.user.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to delete this expense', 403);
    }

    await expense.deleteOne();
    return sendSuccess(res, 'Expense deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
