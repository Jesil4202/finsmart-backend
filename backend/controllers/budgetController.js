import Budget from '../models/Budget.js';

const defaultCategories = [
  { category: 'Food & Dining', limit: 8000, color: '#f59e0b', icon: '🍜' },
  { category: 'Transport', limit: 3000, color: '#3b82f6', icon: '🚗' },
  { category: 'Entertainment', limit: 2000, color: '#8b5cf6', icon: '🎬' },
  { category: 'Shopping', limit: 5000, color: '#ec4899', icon: '🛍️' },
  { category: 'Health', limit: 2000, color: '#10b981', icon: '💊' },
  { category: 'Utilities', limit: 3000, color: '#f97316', icon: '💡' },
];

export const getBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.user.id });
    if (!budget) {
      budget = await Budget.create({ userId: req.user.id, categoryBudgets: defaultCategories });
    }
    let needsSave = false;
    if (budget.categoryBudgets.length === 0) {
      budget.categoryBudgets = defaultCategories;
      needsSave = true;
    } else {
      budget.categoryBudgets.forEach(b => {
        if (b.color && b.color.startsWith('from-')) {
          const defaultCat = defaultCategories.find(dc => dc.category === b.category);
          b.color = defaultCat ? defaultCat.color : '#10b981';
          needsSave = true;
        }
      });
    }
    if (needsSave) {
      budget.markModified('categoryBudgets');
      await budget.save();
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;
    const budget = await Budget.findOne({ userId: req.user.id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    
    const catIndex = budget.categoryBudgets.findIndex(b => b.category === category);
    if(catIndex !== -1) {
       budget.categoryBudgets[catIndex].limit = Number(limit);
       await budget.save();
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMonthlyGoal = async (req, res) => {
  try {
    const { monthlyGoal } = req.body;
    const budget = await Budget.findOne({ userId: req.user.id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    
    budget.monthlyGoal = Number(monthlyGoal);
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
