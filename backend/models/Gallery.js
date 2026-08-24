import mongoose from 'mongoose';

const touristPlaceSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  images: { type: [String], default: [] },
  description: { type: String, trim: true },
  ticketPrice: { type: String, default: 'Free', trim: true },
  duration: { type: String, default: '2-3 hours', trim: true }
}, { _id: false });

const hotelSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  images: { type: [String], default: [] },
  rating: { type: Number, default: 4.8 },
  priceRange: { type: String, default: '$$$' },
  pricePerNight: { type: String, default: '$180/night', trim: true },
  amenities: { type: [String], default: [] }
}, { _id: false });

const foodSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  description: { type: String, trim: true },
  price: { type: String, default: '$15', trim: true }
}, { _id: false });

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  location: { type: String, default: '', trim: true },
  description: { type: String, default: '', trim: true },
  category: { type: String, default: 'Landscape', trim: true },
  imageUrl: { type: String, required: true },
  publicId: { type: String, default: '' },
  galleryImages: { type: [String], default: [] },
  bestTimeToVisit: { type: String, default: 'Year-round', trim: true },
  idealDuration: { type: String, default: '5-7 Days', trim: true },
  estimatedBudget: { type: String, default: '$120-$200/day', trim: true },
  currency: { type: String, default: 'USD ($)', trim: true },
  language: { type: String, default: 'English / Local', trim: true },
  transportation: { type: String, default: '', trim: true },
  travelTips: { type: [String], default: [] },
  touristPlaces: [touristPlaceSchema],
  hotels: [hotelSchema],
  localFoods: [foodSchema],
  featured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
