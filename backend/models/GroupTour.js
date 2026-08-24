import mongoose from 'mongoose';

const groupTourSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  tagline: { type: String, default: 'All-inclusive guided group expedition', trim: true },
  category: { type: String, default: 'Cultural & Adventure', trim: true },
  country: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  durationDays: { type: Number, default: 7 },
  totalCapacity: { type: Number, required: true, default: 20 },
  bookedSeats: { type: Number, default: 0 },
  pricePerPerson: { type: Number, required: true },
  inclusions: [{ type: String }],
  tourGuideName: { type: String, default: 'Senior Tour Maestro' },
  tourGuidePhone: { type: String, default: '+1 (800) 555-TOUR' },
  coverImage: { type: String, required: true },
  publicId: { type: String, default: '' },
  images: [{ type: String }],
  status: { type: String, enum: ['Open', 'Filling Fast', 'Sold Out', 'In Progress', 'Completed'], default: 'Open' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('GroupTour', groupTourSchema);
