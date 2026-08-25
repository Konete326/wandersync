import mongoose from 'mongoose';

const employeeTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: [
      'Booking Verification',
      'Tour Preparation',
      'Customer Followup',
      'Vehicle Inspection',
      'Hotel Coordination',
      'General'
    ],
    default: 'General'
  },
  dueDate: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const EmployeeTask = mongoose.model('EmployeeTask', employeeTaskSchema);
export default EmployeeTask;
