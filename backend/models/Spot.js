import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  category: { type: String, trim: true, default: 'Landmark' },
  description: { type: String, trim: true, default: '' },
  ticketPrice: { type: String, trim: true, default: 'Free' },
  duration: { type: String, trim: true, default: '2-3 hours' },
  bestTimeToVisit: { type: String, trim: true, default: 'Morning' },
  coverImage: { type: String, required: true },
  publicId: { type: String, default: '' },
  images: { type: [String], default: [] },
  address: { type: String, trim: true, default: '' },
  featured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Spot = mongoose.model('Spot', spotSchema);
export default Spot;
