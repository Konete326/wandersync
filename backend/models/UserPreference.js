import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  queryText: { type: String, required: true },
  category: { type: String, default: 'trip_query' },
  embedding: [{ type: Number }],
  metadata: {
    destination: { type: String, default: '' },
    travelStyle: { type: String, default: '' },
    budgetLevel: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

userPreferenceSchema.index({ user: 1, createdAt: -1 });

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);
export default UserPreference;
