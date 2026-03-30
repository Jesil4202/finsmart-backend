import express from 'express';
import { loginUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'User route working' });
});

router.post('/login', loginUser);

export default router;
