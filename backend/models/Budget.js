import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  monthlyGoal: { type: Number, default: 50000 },
  categoryBudgets: [{
    category: String,
    limit: Number,
    color: String,
    icon: String,
  }],
}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);
