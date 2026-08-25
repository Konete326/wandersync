import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: String, default: 'global-lounge', trim: true },
  text: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  images: [{ type: String }],
  destinationTag: { type: String, default: '', trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
