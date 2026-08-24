import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  airline: { type: String, required: true, trim: true },
  flightNumber: { type: String, required: true, trim: true, uppercase: true },
  aircraft: { type: String, default: 'Boeing 787 Dreamliner', trim: true },
  originCountry: { type: String, required: true, trim: true },
  originCity: { type: String, required: true, trim: true },
  originAirport: { type: String, default: 'DXB', trim: true, uppercase: true },
  destinationCountry: { type: String, required: true, trim: true },
  destinationCity: { type: String, required: true, trim: true },
  destinationAirport: { type: String, default: 'HND', trim: true, uppercase: true },
  departureTime: { type: String, default: '10:30 AM' },
  arrivalTime: { type: String, default: '06:45 PM' },
  duration: { type: String, default: '7h 15m (Non-Stop)' },
  cabinClass: { type: String, default: 'Economy' },
  price: { type: String, required: true, trim: true },
  baggage: { type: String, default: '30 kg Check-in + 7 kg Cabin' },
  status: { type: String, default: 'Available' },
  coverImage: { type: String, required: true },
  publicId: { type: String, default: '' },
  images: [{ type: String }],
  bookingUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Flight', flightSchema);
