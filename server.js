import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from './backend/config/db.js';

import userRoutes from './backend/routes/userRoutes.js';
import budgetRoutes from './backend/routes/budgetRoutes.js';
import expenseRoutes from './backend/routes/expenseRoutes.js';
import groupRoutes from './backend/routes/groupRoutes.js';
import aiRoutes from './backend/routes/aiRoutes.js';

// Connect Database
connectDB();

const app = express();

// CORS - must be before all routes
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', (req, res) => res.send('FinSmart API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));