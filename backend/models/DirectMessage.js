import mongoose from 'mongoose';

const directMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    default: '',
    trim: true
  },
  sharedTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null
  },
  images: [{
    type: String
  }],
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

directMessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
export default DirectMessage;
