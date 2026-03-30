import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from './backend/config/db.js';

import userRoutes from './backend/routes/userRoutes.js';
import budgetRoutes from './backend/routes/budgetRoutes.js';
import expenseRoutes from './backend/routes/expenseRoutes.js';
import groupRoutes from './backend/routes/groupRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/ai', aiRoutes);

// Fallback Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));