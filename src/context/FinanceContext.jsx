import { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

export function FinanceProvider({ children }) {
  const [user, setUser] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('fs_token');
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  const fetchUserData = async () => {
    if (!getToken()) { setLoading(false); return; }
    try {
      const [userRes, budgetRes, expenseRes, groupRes] = await Promise.all([
        fetch(`${API_URL}/user`, { headers: getHeaders() }),
        fetch(`${API_URL}/budget`, { headers: getHeaders() }),
        fetch(`${API_URL}/expenses`, { headers: getHeaders() }),
        fetch(`${API_URL}/group/details`, { headers: getHeaders() })
      ]);

      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u);
      } else {
        // Token invalid or expired
        localStorage.removeItem('fs_token');
        setUser(null);
        setLoading(false);
        return;
      }

      if (budgetRes.ok) {
         const bData = await budgetRes.json();
         if (bData && bData.categoryBudgets) {
            setBudgets(bData.categoryBudgets);
            setUser(prev => ({...prev, income: bData.monthlyGoal}));
         }
      }
      if (expenseRes.ok) setExpenses(await expenseRes.json());
      if (groupRes.ok) {
        const g = await groupRes.json();
        setGroup(g);
      }
      
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginUser = async (name) => {
    const res = await fetch(`${API_URL}/user/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('fs_token', data.token);
      await fetchUserData();
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setUser(null);
    setBudgets([]);
    setExpenses([]);
    setGroup(null);
    localStorage.removeItem('fs_token');
  };

  const updateIncome = async (amount) => {
    setUser(prev => ({ ...prev, income: Number(amount) }));
    await fetch(`${API_URL}/budget/goal`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ monthlyGoal: amount })
    });
  };

  const addExpense = async (expense) => {
    // Generate temporary ID for optimistic UI
    const tempId = Date.now().toString();
    const tempExp = { ...expense, _id: tempId };
    setExpenses(prev => [tempExp, ...prev]);

    const res = await fetch(`${API_URL}/expenses`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(expense)
    });
    if (res.ok) {
      const newExp = await res.json();
      // Replace temporary expense with real database expense
      setExpenses(prev => prev.map(e => e._id === tempId ? newExp : e));
    }
  };

  const deleteExpense = async (id) => {
    setExpenses(prev => prev.filter(e => e._id !== id));
    await fetch(`${API_URL}/expenses/${id}`, { 
        method: 'DELETE', headers: getHeaders() 
    });
  };

  const updateBudget = async (category, limit) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, limit: Number(limit) } : b));
    await fetch(`${API_URL}/budget/category`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ category, limit })
    });
  };

  // Group Operations
  const createGroup = async (groupName) => {
    const res = await fetch(`${API_URL}/group/create`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ groupName })
    });
    if (res.ok) setGroup(await res.json());
    return res.ok;
  };

  const joinGroup = async (inviteCode) => {
    const res = await fetch(`${API_URL}/group/join`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ inviteCode })
    });
    if (res.ok) {
       setGroup(await res.json());
       await fetchUserData(); // Load group expenses
       return true;
    }
    return false;
  };

  const getSpentByCategory = (category) => expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);

  const totalBudget = user?.income || budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRemaining = totalBudget - totalSpent;
  const healthScore = totalBudget === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((totalBudget - totalSpent) / totalBudget) * 100 * 1.2)));

  const getFinancialSummary = () => ({
    user: user?.name || 'User',
    monthlyIncome: user?.income || 0,
    totalBudget, totalSpent, totalRemaining, healthScore,
    transactions: expenses.length,
    categories: budgets.map(b => ({
      name: b.category,
      budget: b.limit,
      spent: getSpentByCategory(b.category),
      percent: b.limit === 0 ? (getSpentByCategory(b.category) > 0 ? 100 : 0) : Math.round(getSpentByCategory(b.category) / b.limit * 100)
    })),
    recentExpenses: [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  });

  return (
    <FinanceContext.Provider value={{
      user, loading, loginUser, logoutUser, updateIncome,
      budgets, expenses, group, createGroup, joinGroup,
      addExpense, deleteExpense, updateBudget,
      getSpentByCategory, totalBudget, totalSpent,
      totalRemaining, healthScore, getFinancialSummary,
      getToken // Exposed for internal actions like AI Chat
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFinance = () => useContext(FinanceContext);