import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  groupId: { type: String, default: null },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  note: { type: String, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
