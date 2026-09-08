import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

export default function WishlistForm() {
  const { addWishlistItem } = useFinance();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetMonths, setTargetMonths] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetMonths) return;
    addWishlistItem({
      name,
      targetAmount: parseFloat(targetAmount),
      targetMonths: parseInt(targetMonths, 10),
    });
    setName('');
    setTargetAmount('');
    setTargetMonths('');
  };

  return (
    <div className="bg-white p-7 rounded-3xl shadow-xs">
      <h2 className="text-lg font-bold text-zinc-900 mb-1">Set New Goal</h2>
      <p className="text-xs text-zinc-400 mb-6">Plan ahead for major products</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-2">Item or Milestone</label>
          <input
            type="text"
            required
            placeholder="e.g. Royal Enfield Hunter 350"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-zinc-100/80 transition"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-2">Total Price (NPR)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-xs text-zinc-400 font-semibold">Rs.</span>
            <input
              type="number"
              required
              placeholder="450000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-zinc-50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:bg-zinc-100/80 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500 block mb-2">Target Timeline (Months)</label>
          <input
            type="number"
            required
            placeholder="8"
            value={targetMonths}
            onChange={(e) => setTargetMonths(e.target.value)}
            className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-zinc-100/80 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-xl text-sm transition mt-2 cursor-pointer"
        >
          Create Goal
        </button>
      </form>
    </div>
  );
}