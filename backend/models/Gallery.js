import mongoose from 'mongoose';

const touristPlaceSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  description: { type: String, trim: true }
}, { _id: false });

const hotelSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  rating: { type: Number, default: 4.8 },
  priceRange: { type: String, default: '$$$' }
}, { _id: false });

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    default: 'Landscape',
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    default: ''
  },
  touristPlaces: [touristPlaceSchema],
  hotels: [hotelSchema],
  featured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
