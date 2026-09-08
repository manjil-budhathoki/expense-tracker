import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatNPR } from '../../utils/currency';
import { Trash2 } from 'lucide-react';

export default function ExpenseList() {
  const { expenses, removeExpense, expensesLoading, expensesError } = useFinance();

  if (expensesLoading) {
    return (
      <div className="bg-white p-7 rounded-3xl shadow-xs">
        <p className="text-sm text-zinc-400 py-8 text-center">Loading expenses...</p>
      </div>
    );
  }

  if (expensesError) {
    return (
      <div className="bg-white p-7 rounded-3xl shadow-xs">
        <p className="text-sm text-rose-500 py-8 text-center">Failed to load expenses: {expensesError}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-7 rounded-3xl shadow-xs">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-zinc-900">Purchased Products</h2>
        <span className="text-xs text-zinc-400 font-medium">{expenses.length} recorded</span>
      </div>

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p className="text-sm text-zinc-400 py-8 text-center">No purchases recorded yet.</p>
        ) : (
          expenses.map((expense) => (
            <div 
              key={expense.id} 
              className="p-4 rounded-2xl hover:bg-zinc-50/80 transition flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="font-semibold text-zinc-900 text-sm">{expense.note || 'Unnamed Expense'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                    {expense.category?.name || 'Unknown'}
                  </span>
                  <span className="text-[11px] text-zinc-400">{expense.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-zinc-900 text-sm tracking-tight">
                  {formatNPR(expense.amount)}
                </span>
                <button
                  onClick={() => removeExpense(expense.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-rose-500 transition p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}