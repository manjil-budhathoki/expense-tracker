import React from 'react';
import { NavLink } from 'react-router-dom';
import { useFinance } from '../../context/FinanceContext';
import { formatNPR } from '../../utils/currency';

export default function Navbar() {
  const { monthlySalary, setMonthlySalary, monthlySavingsCapacity, allocationPercent } = useFinance();

  const getLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all ${
      isActive
        ? 'bg-zinc-900 text-white shadow-xs'
        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
    }`;

  return (
    <header className="w-full max-w-6xl mx-auto pt-6 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
        {/* Brand & Pill Nav */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <span className="font-black text-xl tracking-tight text-zinc-900">
            Paisa<span className="text-indigo-600">.</span>
          </span>
          <nav className="flex items-center bg-zinc-200/60 p-1 rounded-full flex-wrap gap-1">
            <NavLink to="/" className={getLinkClass}>Overview</NavLink>
            <NavLink to="/expenses" className={getLinkClass}>Expenses</NavLink>
            <NavLink to="/wishlist" className={getLinkClass}>Goals & Pots</NavLink>
            <NavLink to="/rent" className={getLinkClass}>Rent & Bills</NavLink>
          </nav>
        </div>

        {/* Salary Widget */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-xs text-xs text-zinc-500">
          <span>Salary</span>
          <div className="flex items-center gap-1 font-semibold text-zinc-800">
            <span>Rs.</span>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
              className="w-20 bg-transparent border-b border-zinc-300 focus:border-zinc-800 focus:outline-none text-zinc-900 font-semibold"
            />
          </div>
          <span className="text-zinc-300">•</span>
          <span className="text-emerald-600 font-medium">
            Save {formatNPR(monthlySavingsCapacity)}/mo ({allocationPercent}%)
          </span>
        </div>
      </div>
    </header>
  );
}