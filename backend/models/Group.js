import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  members: [{ type: String }],
  createdBy: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);
