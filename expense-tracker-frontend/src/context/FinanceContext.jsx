import { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { calculateSavingsCapacity } from '../utils/calculations';
import { fetchCategories, fetchExpenses, createExpense, updateExpense, deleteExpense as apiDeleteExpense } from '../utils/expenseApi';
import { get, put, post } from '../utils/api';

const FinanceContext = createContext(null);
const defaults = { monthlySalary: 0, allocationPercent: 25, wishlistPots: [], longTermGoals: [], rentConfig: { baseRent: 0, electricityRate: 0, waterWasteFee: 0 }, rentHistory: [] };
// eslint-disable-next-line react-refresh/only-export-components
export const localDate = () => new Date().toLocaleDateString('en-CA');

export function FinanceProvider({ children }) {
  const [finance, setFinance] = useState(defaults);
  const stateRef = useRef({ data: defaults, revision: 0 });
  const queue = useRef(Promise.resolve());
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [cats, state] = await Promise.all([fetchCategories(), get('/v1/finance/')]);
        const all = [];
        let page;
        do {
          page = await fetchExpenses({ skip: all.length, limit: 1000 });
          all.push(...page.items);
        } while (all.length < page.total && page.items.length);
        if (active) { setCategories(cats); setExpenses(all); setFinance(state.data); stateRef.current = state; }
      } catch (err) { if (active) setExpensesError(err.message); }
      finally { if (active) setExpensesLoading(false); }
    }
    load();
    return () => { active = false; };
  }, []);

  // Serialize writes so rapid edits always use the latest acknowledged revision.
  const mutateFinance = (transform) => {
    setPending(n => n + 1);
    const result = queue.current.then(async () => {
      try {
        setSaveError(null);
        const data = transform(stateRef.current.data);
        const saved = await put('/v1/finance/', { revision: stateRef.current.revision, data });
        stateRef.current = saved;
        setFinance(saved.data);
        return true;
      } catch (err) { setSaveError(err.message); return false; }
      finally { setPending(n => n - 1); }
    });
    queue.current = result;
    return result;
  };
  const expenseAction = async (operation) => {
    setSaveError(null);
    try { await operation(); return true; }
    catch (err) { setSaveError(err.message); return false; }
  };
  const addExpense = data => expenseAction(async () => {
    const created = await createExpense(data);
    setExpenses(previous => [created, ...previous]);
  });
  const editExpense = (id, data) => expenseAction(async () => {
    const updated = await updateExpense(id, data);
    setExpenses(previous => previous.map(item => item.id === id ? updated : item));
  });
  const removeExpense = id => expenseAction(async () => {
    await apiDeleteExpense(id);
    setExpenses(previous => previous.filter(item => item.id !== id));
  });
  const addCategory = name => expenseAction(async () => {
    const created = await post('/v1/categories/', { name });
    setCategories(previous => [...previous, created]);
  });
  const totalExpenses = useMemo(() => expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const value = {
    ...finance, categories, expenses, expensesLoading, expensesError, saveError, saving: pending > 0,
    totalExpenses, addExpense, editExpense, removeExpense, addCategory,
    monthlySavingsCapacity: calculateSavingsCapacity(finance.monthlySalary, finance.allocationPercent),
    setMonthlySalary: value => mutateFinance(s => ({...s, monthlySalary: value})), setAllocationPercent: value => mutateFinance(s => ({...s, allocationPercent: value})),
    setLongTermGoals: value => mutateFinance(s => ({...s, longTermGoals: typeof value === 'function' ? value(s.longTermGoals) : value})),
    addWishlistPot: pot => mutateFinance(s => ({ ...s, wishlistPots: [{ ...pot, id: crypto.randomUUID() }, ...s.wishlistPots] })),
    removeWishlistPot: id => mutateFinance(s => ({ ...s, wishlistPots: s.wishlistPots.filter(p => p.id !== id) })),
    depositToPot: (id, amount) => mutateFinance(s => {
      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) throw new Error('Enter a positive deposit.');
      return { ...s, wishlistPots: s.wishlistPots.map(p => p.id === id ? { ...p, currentSaved: p.currentSaved + Number(amount) } : p) };
    }),
    updatePotPledge: (id, amount) => mutateFinance(s => ({ ...s, wishlistPots: s.wishlistPots.map(p => p.id === id ? { ...p, monthlyPledge: Number(amount) } : p) })),
    updateRentConfig: config => mutateFinance(s => ({ ...s, rentConfig: { ...s.rentConfig, ...config } })),
    recordRentPayment: entry => mutateFinance(s => ({ ...s, rentHistory: [{ ...entry, id: crypto.randomUUID(), paidDate: localDate() }, ...s.rentHistory] })),
    deleteRentRecord: id => mutateFinance(s => ({ ...s, rentHistory: s.rentHistory.filter(r => r.id !== id) })),
  };
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

// Context hooks are intentionally exported beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
