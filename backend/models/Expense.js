import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD ($)', trim: true },
  category: {
    type: String,
    enum: [
      'AI & LLM Compute',
      'Cloud Infrastructure',
      'Media CDN & Storage',
      'APIs & Services',
      'Domain & Hosting',
      'Accommodation',
      'Food & Dining',
      'Transit & Transport',
      'Activities & Tours',
      'Operations & Other'
    ],
    default: 'Operations & Other'
  },
  vendor: { type: String, trim: true, default: 'WanderSync Platform' },
  billingCycle: {
    type: String,
    enum: ['Monthly', 'Annually', 'One-time', 'Usage-based'],
    default: 'Monthly'
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Scheduled', 'Overdue'],
    default: 'Paid'
  },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '', trim: true },
  receiptImage: { type: String, default: '' },
  isPlatformExpense: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
