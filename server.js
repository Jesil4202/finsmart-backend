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

// Middleware
// CORS — allow Vercel frontend + local dev
const allowedOrigins = [
  /^https:\/\/.*\.vercel\.app$/,       // any Vercel preview/prod domain
  /^http:\/\/localhost:\d+$/,          // any localhost port (dev)
  /^http:\/\/127\.0\.0\.1:\d+$/,       // 127.0.0.1 variants
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(pattern => pattern.test(origin));
    if (allowed) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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