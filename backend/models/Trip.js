import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  timeSlot: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  locationName: { type: String, required: true },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  durationHours: { type: Number, default: 2 },
  estimatedCost: { type: Number, default: 0 },
  category: { type: String, enum: ['Sightseeing', 'Food', 'Culture', 'Adventure', 'Relaxation', 'Transit'], default: 'Sightseeing' },
  bookingLink: { type: String, default: '' },
  completed: { type: Boolean, default: false }
});

const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  theme: { type: String, default: '' },
  activities: [activitySchema]
});

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  destination: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  coverImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  durationDays: { type: Number, required: true },
  budgetLevel: { type: String, enum: ['Budget', 'Moderate', 'Luxury'], default: 'Moderate' },
  estimatedTotalCost: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  overview: { type: String, required: true },
  highlights: [{ type: String }],
  days: [daySchema],
  travelTips: {
    packing: [{ type: String }],
    localEtiquette: [{ type: String }],
    transitAdvice: [{ type: String }]
  },
  isPublic: { type: Boolean, default: false },
  shareSlug: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
