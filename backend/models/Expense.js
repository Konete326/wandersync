import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Accommodation', 'Food', 'Transit', 'Activities', 'Shopping', 'Other'],
    default: 'Other'
  },
  date: { type: Date, default: Date.now },
  receiptImage: { type: String, default: '' }
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
