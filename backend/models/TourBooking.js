import mongoose from 'mongoose';

const tourBookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true, uppercase: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupTour', required: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, trim: true, lowercase: true },
  customerPhone: { type: String, required: true, trim: true },
  passengersCount: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  totalPaid: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Stripe', 'POS Terminal'], default: 'POS Terminal' },
  paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Pending'], default: 'Paid' },
  specialRequests: { type: String, default: '' },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('TourBooking', tourBookingSchema);
