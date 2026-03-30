import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

export const getExpenses = async (req, res) => {
  try {
    const group = await Group.findOne({ members: req.user.id });
    let expenses;

    if (group) {
      expenses = await Expense.find({ groupId: group._id }).sort({ date: -1 }).lean();
      const users = await User.find({ userId: { $in: group.members } });
      const userMap = users.reduce((acc, u) => ({ ...acc, [u.userId]: u.name }), {});
      expenses = expenses.map(e => ({ ...e, userName: userMap[e.userId] || 'Unknown' }));
    } else {
      expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 }).lean();
      const u = await User.findOne({ userId: req.user.id });
      expenses = expenses.map(e => ({ ...e, userName: u?.name || 'Unknown' }));
    }
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const { amount, category, note, date } = req.body;
    if (!amount || !category || !note || !date) return res.status(400).json({ message: 'All fields required' });
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const group = await Group.findOne({ members: req.user.id });
    const expense = await Expense.create({
      userId: req.user.id,
      groupId: group ? group._id : null,
      amount: Number(amount),
      category,
      note,
      date,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    const group = await Group.findOne({ members: req.user.id });
    if (expense.userId !== req.user.id && (!group || group._id.toString() !== expense.groupId)) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
