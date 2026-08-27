import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FriendGroup',
    required: true
  },
  sender: {
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
  }]
}, {
  timestamps: true
});

groupMessageSchema.index({ group: 1, createdAt: 1 });

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);
export default GroupMessage;
