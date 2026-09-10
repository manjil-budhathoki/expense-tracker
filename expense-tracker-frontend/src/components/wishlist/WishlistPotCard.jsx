import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatNPR } from '../../utils/currency';
import { Plus, CheckCircle2 } from 'lucide-react';

export default function WishlistPotCard({ pot }) {
  const { depositToPot, updatePotPledge, saving } = useFinance();
  const [depositAmount, setDepositAmount] = useState('');
  const [isEditingPledge, setIsEditingPledge] = useState(false);
  const [pledgeInput, setPledgeInput] = useState(pot.monthlyPledge || 5000);

  const remaining = Math.max(0, pot.targetAmount - pot.currentSaved);
  const percentage = Math.min(100, Math.round((pot.currentSaved / pot.targetAmount) * 100));
  const isCompleted = remaining <= 0;

  // Individual time remaining based on this specific item's monthly pledge
  const monthsRemaining = pot.monthlyPledge > 0 
    ? (remaining / pot.monthlyPledge).toFixed(1) 
    : '∞';

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;
    if (!await depositToPot(pot.id, depositAmount)) return;
    setDepositAmount('');
  };

  const handleSavePledge = async (e) => {
    e.preventDefault();
    if (!await updatePotPledge(pot.id, Number(pledgeInput))) return;
    setIsEditingPledge(false);
  };

  return (
    <div className="bg-white p-7 rounded-3xl shadow-xs space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-zinc-900 text-lg">{pot.name}</h3>
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Achieved!
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Target Cost: <span className="font-semibold text-zinc-700">{formatNPR(pot.targetAmount)}</span>
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-zinc-900">{percentage}%</span>
          <span className="text-[11px] text-zinc-400 block font-medium">filled</span>
        </div>
      </div>

      {/* Visual Filling Pot Gauge */}
      <div className="space-y-2">
        <div className="w-full bg-zinc-100 h-3.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isCompleted ? 'bg-emerald-500' : 'bg-zinc-900'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-medium text-zinc-500">
          <span>Saved: <strong className="text-zinc-800">{formatNPR(pot.currentSaved)}</strong></span>
          <span>Remaining: <strong className="text-zinc-800">{formatNPR(remaining)}</strong></span>
        </div>
      </div>

      {/* Individual Monthly Allocation & Timeline Forecast */}
      <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
        <div>
          <span className="text-zinc-400 block">Dedicated for this goal:</span>
          {isEditingPledge ? (
            <form onSubmit={handleSavePledge} className="flex items-center gap-1.5 mt-1">
              <input
                type="number" min="0" step="0.01"
                aria-label="Monthly contribution"
                value={pledgeInput}
                onChange={(e) => setPledgeInput(e.target.value)}
                className="w-20 bg-white border border-zinc-300 rounded px-1.5 py-0.5 text-xs font-semibold text-zinc-800"
              />
              <button type="submit" disabled={saving} className="text-indigo-600 font-bold hover:underline">Save</button>
            </form>
          ) : (
            <button type="button"
              onClick={() => setIsEditingPledge(true)}
              className="font-bold text-zinc-800 cursor-pointer hover:underline"
            >
              {formatNPR(pot.monthlyPledge || 0)}/month <span className="text-zinc-400 font-normal text-[10px]">(edit)</span>
            </button>
          )}
        </div>

        <div className="text-left sm:text-right">
          <span className="text-zinc-400 block">Time to reach target:</span>
          <span className="font-bold text-indigo-700">
            {isCompleted ? 'Completed' : `~${monthsRemaining} Months`}
          </span>
        </div>
      </div>

      {/* Add Money Deposit Form */}
      {!isCompleted && (
        <form onSubmit={handleDeposit} className="flex gap-2 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-zinc-400">Rs.</span>
            <input
              type="number" min="0" step="0.01"
              aria-label={`Deposit to ${pot.name}`}
              max={remaining}
              placeholder="Deposit amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-zinc-50 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:bg-zinc-100 transition font-medium"
            />
          </div>
          <button
            type="submit" disabled={saving}
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>
      )}
    </div>
  );
}