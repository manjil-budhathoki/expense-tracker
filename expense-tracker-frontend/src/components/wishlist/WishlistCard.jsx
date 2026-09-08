import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { calculateGoalProjections } from '../../utils/calculations';
import { formatNPR } from '../../utils/currency';

export default function WishlistCard({ item }) {
  const { monthlySavingsCapacity, allocationPercent } = useFinance();

  const projection = calculateGoalProjections({
    targetAmount: item.targetAmount,
    targetMonths: item.targetMonths,
    monthlyCapacity: monthlySavingsCapacity,
    allocationPercent,
  });

  return (
    <div className="bg-white p-7 rounded-3xl shadow-xs space-y-6">
      {/* Top Details */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-bold text-zinc-900 text-lg">{item.name}</h3>
          <p className="text-xs text-zinc-400">
            Target: <span className="font-semibold text-zinc-700">{formatNPR(item.targetAmount)}</span> in {item.targetMonths} months
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-medium">Need to Save</span>
          <span className="text-base font-bold text-zinc-800">
            {formatNPR(projection.requiredMonthlySaving)}/mo
          </span>
        </div>
      </div>

      {/* Insight Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Metric 1: Timeline */}
        <div className="bg-zinc-50 p-4 rounded-2xl">
          <span className="text-xs text-zinc-400 block mb-1">Pace at current savings</span>
          <p className="text-sm font-bold text-zinc-800">
            ~{projection.monthsAtCurrentRate} Months
          </p>
        </div>

        {/* Metric 2: Income Growth Target */}
        <div className={`p-4 rounded-2xl ${
          projection.isAchievable 
            ? 'bg-emerald-50/70 text-emerald-900' 
            : 'bg-amber-50/70 text-amber-900'
        }`}>
          <span className="text-xs block opacity-75 mb-1">
            {projection.isAchievable ? 'Goal Feasibility' : 'Required Income Boost'}
          </span>
          <p className="text-sm font-bold">
            {projection.isAchievable
              ? '✓ On track with current salary'
              : `+${formatNPR(projection.additionalIncomeNeeded)}/mo salary`}
          </p>
        </div>
      </div>
    </div>
  );
}