import express from 'express';
import { createGroup, joinGroup, getGroupDetails } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createGroup);
router.post('/join', protect, joinGroup);
router.get('/details', protect, getGroupDetails);

export default router;
