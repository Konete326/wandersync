import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  role: {
    type: String,
    required: true,
    enum: [
      'Tour Guide',
      'Booking Manager',
      'Fleet Coordinator',
      'Customer Support',
      'Logistics Lead',
      'Finance Officer',
      'Operations Staff'
    ],
    default: 'Operations Staff'
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Tour Operations',
      'Ticketing & POS',
      'Transport & Fleet',
      'Customer Experience',
      'Finance & Accounting',
      'General Logistics'
    ],
    default: 'Tour Operations'
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'inactive'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  salary: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
