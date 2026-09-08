import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { fetchCategories } from '../../utils/expenseApi';

export default function ExpenseForm() {
  const { addExpense, categories } = useFinance();
  const [product, setProduct] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().then((cats) => {
        if (cats.length > 0 && !categoryId) {
          setCategoryId(String(cats[0].id));
        }
      }).catch(() => {});
    } else if (!categoryId && categories.length > 0) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories, categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !amount || !categoryId) return;
    setSubmitting(true);
    try {
      await addExpense({
        note: product,
        category_id: Number(categoryId),
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
      });
      setProduct('');
      setAmount('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-7 rounded-3xl shadow-xs">
      <h2 className="text-lg font-bold text-zinc-900 mb-1">Add Expense</h2>
      <p className="text-xs text-zinc-400 mb-6">Track products you recently bought</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-2">Product Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Marshall Speaker"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-zinc-100/80 transition"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-2">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-zinc-100/80 transition text-zinc-700"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-2">Cost (NPR)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-xs text-zinc-400 font-semibold">Rs.</span>
            <input
              type="number"
              required
              placeholder="4500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:bg-zinc-100/80 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-xl text-sm transition mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </div>
  );
}