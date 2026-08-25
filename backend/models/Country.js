import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  code: { type: String, trim: true, default: '' },
  continent: { type: String, trim: true, default: 'Asia' },
  currency: { type: String, trim: true, default: 'USD ($)' },
  language: { type: String, trim: true, default: 'English' },
  timezone: { type: String, trim: true, default: 'UTC' },
  description: { type: String, trim: true, default: '' },
  coverImage: { type: String, required: true },
  publicId: { type: String, default: '' },
  images: { type: [String], default: [] },
  popularCities: [{
    name: { type: String, trim: true },
    description: { type: String, trim: true, default: '' },
    coverImage: { type: String, default: '' },
    images: { type: [String], default: [] }
  }],
  featured: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Country = mongoose.model('Country', countrySchema);
export default Country;
