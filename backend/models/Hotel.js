import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  area: { type: String, trim: true, default: '' },
  rating: { type: Number, default: 4.8 },
  priceRange: { type: String, trim: true, default: '$$$' },
  pricePerNight: { type: String, trim: true, default: '$180/night' },
  amenities: { type: [String], default: [] },
  coverImage: { type: String, required: true },
  publicId: { type: String, default: '' },
  images: { type: [String], default: [] },
  address: { type: String, trim: true, default: '' },
  bookingUrl: { type: String, trim: true, default: '' },
  contactPhone: { type: String, trim: true, default: '' },
  contactEmail: { type: String, trim: true, default: '' },
  featured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
