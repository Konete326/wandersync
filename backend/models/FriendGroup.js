import mongoose from 'mongoose';

const friendGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  icon: {
    type: String,
    default: 'Users'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    text: { type: String, default: '' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedTrip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    createdAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

const FriendGroup = mongoose.model('FriendGroup', friendGroupSchema);
export default FriendGroup;
