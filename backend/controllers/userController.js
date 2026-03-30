import User from '../models/User.js';
import Budget from '../models/Budget.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const generateToken = (id, name) => {
  return jwt.sign({ id, name }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const loginUser = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    let user = await User.findOne({ name });
    if (!user) {
      user = await User.create({ name, userId: uuidv4() });
      await Budget.create({ userId: user.userId }); // Initiate default global budget
    }

    res.json({
      _id: user._id,
      name: user.name,
      userId: user.userId,
      token: generateToken(user.userId, user.name),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
