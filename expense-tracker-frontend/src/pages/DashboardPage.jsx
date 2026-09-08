import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatNPR } from '../utils/currency';
import ClockCalendar from '../components/dashboard/ClockCalendar';
import WishlistPotCard from '../components/wishlist/WishlistPotCard';

export default function DashboardPage() {
  const { totalExpenses, wishlistPots } = useFinance();

  return (
    <div className="space-y-8">
      {/* 1. Live Clock & Nepali/English Calendar */}
      <ClockCalendar />

      {/* 2. Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl shadow-xs">
          <span className="text-xs font-medium text-zinc-400 block mb-2">Total Tracked Expenses</span>
          <div className="text-2xl font-bold text-zinc-900 tracking-tight">
            {formatNPR(totalExpenses)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xs">
          <span className="text-xs font-medium text-zinc-400 block mb-2">Active Savings Pots</span>
          <div className="text-2xl font-bold text-zinc-900 tracking-tight">
            {wishlistPots?.length || 0} Individual Goals
          </div>
        </div>
      </div>

      {/* 3. Wishlist Savings Pots Quick View */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-900">Active Savings Pots</h2>
          <span className="text-xs text-zinc-400">Independent savings progress</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {wishlistPots && wishlistPots.map((pot) => (
            <WishlistPotCard key={pot.id} pot={pot} />
          ))}
        </div>
      </div>
    </div>
  );
}