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
    return sendSuccess(res, 'Expenses fetched successfully', { expenses, totalAmount, categoryBreakdown });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getPlatformExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = { isPlatformExpense: true };
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    if (req.query.status && req.query.status !== 'All') filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { vendor: new RegExp(req.query.search, 'i') },
        { notes: new RegExp(req.query.search, 'i') }
      ];
    }
    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email').lean();
    const allPlatform = await Expense.find({ isPlatformExpense: true }).lean();
    const totalSpent = allPlatform.filter((e) => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
    const pendingAmount = allPlatform.filter((e) => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
    const uniqueVendors = new Set(allPlatform.map((e) => e.vendor)).size;
    const monthlyBurnRate = allPlatform.filter((e) => e.billingCycle === 'Monthly' && e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
    return sendSuccess(res, 'Platform expenses fetched', {
      expenses,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      stats: { totalSpent, pendingAmount, uniqueVendors, monthlyBurnRate, totalRecords: allPlatform.length }
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const createPlatformExpense = async (req, res) => {
  try {
    const { title, amount, category, vendor, billingCycle, status, date, notes, currency } = req.body;
    if (!title || amount === undefined) return sendError(res, 'Title and amount are required', 400);
    const expense = await Expense.create({
      user: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      category: category || 'Operations & Other',
      vendor: vendor ? vendor.trim() : 'WanderSync Infrastructure',
      billingCycle: billingCycle || 'Monthly',
      status: status || 'Paid',
      currency: currency || 'USD ($)',
      date: date || Date.now(),
      notes: notes ? notes.trim() : '',
      isPlatformExpense: true
    });
    return sendSuccess(res, 'Platform expense recorded', expense, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updatePlatformExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, isPlatformExpense: true });
    if (!expense) return sendError(res, 'Platform expense record not found', 404);
    const fields = ['title', 'amount', 'category', 'vendor', 'billingCycle', 'status', 'date', 'notes', 'currency'];
    fields.forEach((f) => { if (req.body[f] !== undefined) expense[f] = f === 'amount' ? Number(req.body[f]) : req.body[f]; });
    await expense.save();
    return sendSuccess(res, 'Platform expense updated', expense);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const addExpense = async (req, res) => {
  try {
    const { trip, title, amount, category, date, receiptImage } = req.body;
    if (!trip || !title || !amount) return sendError(res, 'Trip ID, title, and amount are required', 400);
    const expense = await Expense.create({
      trip,
      user: req.user._id,
      title,
      amount: Number(amount),
      category: category || 'Operations & Other',
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
    if (!expense) return sendError(res, 'Expense not found', 404);
    if (!expense.isPlatformExpense && expense.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to delete this expense', 403);
    }
    await expense.deleteOne();
    return sendSuccess(res, 'Expense deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
