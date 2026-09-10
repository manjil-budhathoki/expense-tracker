import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { calculateMilestoneHorizon } from '../../utils/calculations';
import { formatNPR } from '../../utils/currency';
import mockData from '../../data/mockData.json';
import { Sparkles } from 'lucide-react';

export default function LongTermSimulator() {
  const { monthlySalary, allocationPercent, longTermGoals, setLongTermGoals, saving } = useFinance();
  
  // Future Projected Salary Slider state (starts at 1.5x current salary)
  const [projectedSalary, setProjectedSalary] = useState(Math.max(50000, monthlySalary * 2));
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const bounds = mockData.sliderBounds.longTermSalary;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xs space-y-8">
      {/* Title & Description */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-zinc-900">Long-Term Milestone Simulator</h2>
        </div>
        <p className="text-xs text-zinc-400">
          Simulate what salary increases you need to purchase land, homes, or vehicles without loans.
        </p>
      </div>

      {/* Dream Salary Interactive Slider */}
      <div className="bg-zinc-50 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            What if my monthly salary becomes:
          </span>
          <span className="text-2xl font-black text-indigo-600 tracking-tight">
            {formatNPR(projectedSalary)} <span className="text-xs font-normal text-zinc-400">/mo</span>
          </span>
        </div>

        <input
          type="range"
          aria-label="Projected monthly salary"
          min={String(bounds.min)}
          max={String(bounds.max)}
          step={String(bounds.step)}
          value={projectedSalary}
          onChange={(e) => setProjectedSalary(Number(e.target.value))}
          className="w-full accent-indigo-600 h-2 bg-zinc-200 rounded-lg cursor-pointer appearance-none"
        />

        <div className="flex justify-between text-[11px] text-zinc-400">
          <span>{formatNPR(bounds.min)}/mo</span>
          <span>Dedicated to dreams ({allocationPercent}%): {formatNPR((projectedSalary * allocationPercent) / 100)}/mo</span>
          <span>{formatNPR(bounds.max)}/mo</span>
        </div>
      </div>

      <form className="budget-form" onSubmit={async e => { e.preventDefault(); if(await setLongTermGoals(goals => [...goals, {id: crypto.randomUUID(), name: name.trim(), cost: Number(cost)}])) {setName('');setCost('');} }}>
        <label>Milestone name<input required maxLength="200" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. A new home"/></label>
        <label>Target cost (NPR)<input required type="number" min="0.01" step="0.01" value={cost} onChange={e=>setCost(e.target.value)}/></label>
        <button className="primary-button" disabled={saving}>Add milestone</button>
      </form>
      {/* Horizon Projections for Big Goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {longTermGoals.map((goal) => {
          const { years, totalMonths } = calculateMilestoneHorizon(
            goal.cost,
            projectedSalary,
            allocationPercent
          );

          return (
            <div key={goal.id} className="bg-zinc-50/70 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Target Milestone</span>
                <h4 className="font-bold text-zinc-900 text-base mt-0.5">{goal.name}</h4>
                <p className="text-xs font-semibold text-zinc-500 mt-1">{formatNPR(goal.cost)}</p>
              </div>

              <div className="pt-3 border-t border-zinc-200/60">
                <span className="text-[11px] text-zinc-400 block">Time to acquire in full:</span>
                <p className="text-lg font-black text-zinc-900 mt-0.5">
                  {years} <span className="text-xs font-medium text-zinc-500">Years ({totalMonths} mos)</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}