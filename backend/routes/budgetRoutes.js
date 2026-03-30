import express from 'express';
import { getBudget, updateBudget, updateMonthlyGoal } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getBudget);
router.put('/category', protect, updateBudget);
router.put('/goal', protect, updateMonthlyGoal);

export default router;
