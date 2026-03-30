import express from 'express';
import { loginUser, getUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/', protect, getUser);

export default router;
