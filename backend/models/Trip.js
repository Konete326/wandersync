import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  timeSlot: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  locationName: { type: String, required: true },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  durationHours: { type: Number, default: 2 },
  estimatedCost: { type: Number, default: 0 },
  category: { 
    type: String, 
    enum: ['Sightseeing', 'Food', 'Culture', 'Adventure', 'Relaxation', 'Transit', 'Travel', 'Shopping', 'Entertainment', 'Dining', 'Lodging', 'Nature', 'Nightlife', 'Other'], 
    default: 'Sightseeing' 
  },
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
  featured: { type: Boolean, default: false },
  shareSlug: { type: String, unique: true, sparse: true },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    role: { type: String, enum: ['editor', 'viewer'], default: 'editor' },
    addedAt: { type: Date, default: Date.now }
  }],
  selectedFlight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', default: null },
  selectedHotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', default: null },
  selectedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  selectedCabService: {
    pickupLocation: { type: String, default: '' },
    dropoffLocation: { type: String, default: '' },
    cabType: { type: String, default: 'Standard Sedan' },
    estimatedFare: { type: Number, default: 0 },
    bookedAt: { type: Date, default: null }
  },
  bookingRequest: {
    status: { type: String, enum: ['none', 'pending', 'confirmed', 'rejected', 'partially_confirmed', 'cancellation_requested'], default: 'none' },
    requestedAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    totalAmount: { type: Number, default: 0 },
    userNotes: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    flightStatus: { type: String, enum: ['none', 'pending', 'confirmed', 'rejected'], default: 'none' },
    hotelStatus: { type: String, enum: ['none', 'pending', 'confirmed', 'rejected'], default: 'none' },
    vehicleStatus: { type: String, enum: ['none', 'pending', 'confirmed', 'rejected'], default: 'none' },
    cancellationRequest: {
      isPending: { type: Boolean, default: false },
      itemType: { type: String, enum: ['flight', 'hotel', 'vehicle', 'cab', 'all', ''], default: '' },
      reason: { type: String, default: '' },
      requestedAt: { type: Date, default: null }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
