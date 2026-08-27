import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    enum: ['mention', 'direct_message', 'friend_request', 'trip_invite', 'trip_joined'],
    default: 'mention'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: '/community'
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    room: { type: String, default: '' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'FriendGroup' },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    messageId: { type: String, default: '' }
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
