import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  vehicleType: { type: String, trim: true, default: 'SUV' },
  capacity: { type: String, trim: true, default: '5 Passengers' },
  transmission: { type: String, trim: true, default: 'Automatic' },
  fuelType: { type: String, trim: true, default: 'Petrol' },
  pricePerDay: { type: String, trim: true, default: '$95/day' },
  pricePerHour: { type: String, trim: true, default: '$20/hr' },
  driverIncluded: { type: Boolean, default: true },
  features: { type: [String], default: [] },
  coverImage: { type: String, required: true },
  publicId: { type: String, default: '' },
  images: { type: [String], default: [] },
  country: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  status: { type: String, trim: true, default: 'Available' },
  featured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
