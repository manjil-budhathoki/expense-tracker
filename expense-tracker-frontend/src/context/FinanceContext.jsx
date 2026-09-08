import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { calculateSavingsCapacity } from '../utils/calculations';
import { fetchCategories, fetchExpenses, createExpense, deleteExpense as apiDeleteExpense } from '../utils/expenseApi';
import mockData from '../data/mockData.json';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [monthlySalary, setMonthlySalary] = useState(mockData.defaultSalary);
  const [allocationPercent, setAllocationPercent] = useState(mockData.defaultAllocationPercent);

  const monthlySavingsCapacity = useMemo(() => {
    return calculateSavingsCapacity(monthlySalary, allocationPercent);
  }, [monthlySalary, allocationPercent]);

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [cats, expsRes] = await Promise.all([
          fetchCategories(),
          fetchExpenses({ limit: 100 }),
        ]);
        setCategories(cats);
        setExpenses(expsRes.items || []);
      } catch (err) {
        setExpensesError(err.message);
      } finally {
        setExpensesLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const addExpense = async (expense) => {
    const payload = {
      amount: expense.amount,
      category_id: expense.category_id,
      note: expense.note || expense.product,
      date: expense.date || new Date().toISOString().split('T')[0],
      type: "expense",
      payment_method: "Cash",
    };
    const created = await createExpense(payload);
    setExpenses((prev) => [created, ...prev]);
  };

  const removeExpense = async (id) => {
    await apiDeleteExpense(id);
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // ==========================================
  // 3. INDIVIDUAL WISHLIST POTS (SELF-CONTAINED)
  // ==========================================
  const [wishlistPots, setWishlistPots] = useState(mockData.initialWishlistPots);

  // Deposit money into a specific pot (e.g. + Rs. 3,300)
  const depositToPot = (potId, amount) => {
    setWishlistPots((prev) =>
      prev.map((pot) =>
        pot.id === potId
          ? {
              ...pot,
              currentSaved: Math.min(
                pot.targetAmount,
                pot.currentSaved + Math.max(0, Number(amount))
              ),
            }
          : pot
      )
    );
  };

  // Update how much you personally dedicate each month to a specific pot
  const updatePotPledge = (potId, monthlyPledge) => {
    setWishlistPots((prev) =>
      prev.map((pot) =>
        pot.id === potId ? { ...pot, monthlyPledge: Number(monthlyPledge) } : pot
      )
    );
  };

  // Create a new individual pot
  const addWishlistPot = (pot) => {
    setWishlistPots((prev) => [
      {
        ...pot,
        id: Date.now(),
        currentSaved: Number(pot.currentSaved) || 0,
        monthlyPledge: Number(pot.monthlyPledge) || 5000,
      },
      ...prev,
    ]);
  };

  const removeWishlistPot = (potId) => {
    setWishlistPots((prev) => prev.filter((pot) => pot.id !== potId));
  };

  // ==========================================
  // 4. LONG-TERM LIFE GOALS (HOUSE, LAND, CAR)
  // ==========================================
  const [longTermGoals, setLongTermGoals] = useState(mockData.initialLongTermGoals);

  // ==========================================
  // 5. RENT & UTILITIES (METER & LANDLORD TRACKER)
  // ==========================================
  const [rentConfig, setRentConfig] = useState(mockData.defaultRentConfig);

  const [rentHistory, setRentHistory] = useState(mockData.initialRentHistory);

  const updateRentConfig = (newConfig) => {
    setRentConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const recordRentPayment = (entry) => {
    setRentHistory((prev) => [
      {
        id: Date.now(),
        ...entry,
        paidDate: new Date().toISOString().split('T')[0],
      },
      ...prev,
    ]);
  };

  const deleteRentRecord = (id) => {
    setRentHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // ==========================================
  // CONTEXT PROVIDER VALUE
  // ==========================================
  const value = {
    // Salary & Budget
    monthlySalary,
    setMonthlySalary,
    allocationPercent,
    setAllocationPercent,
    monthlySavingsCapacity,

    // Categories
    categories,
    expensesLoading,
    expensesError,

    // Expenses
    expenses,
    totalExpenses,
    addExpense,
    removeExpense,

    // Wishlist Pots
    wishlistPots,
    depositToPot,
    updatePotPledge,
    addWishlistPot,
    removeWishlistPot,

    // Long-Term Milestones
    longTermGoals,
    setLongTermGoals,

    // Rent & Utilities
    rentConfig,
    updateRentConfig,
    rentHistory,
    recordRentPayment,
    deleteRentRecord,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};