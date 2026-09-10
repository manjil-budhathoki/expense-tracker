import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import mockData from '../../data/mockData.json';
import { Target } from 'lucide-react';

export default function WishlistPotForm() {
  const { addWishlistPot, saving } = useFinance();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [monthlyPledge, setMonthlyPledge] = useState(mockData.formDefaults.monthlyPledge);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    const ok = await addWishlistPot({
      name,
      targetAmount: parseFloat(targetAmount),
      currentSaved: parseFloat(initialDeposit) || 0,
      monthlyPledge: Number(monthlyPledge),
    });
    if (!ok) return;
    setName('');
    setTargetAmount('');
    setInitialDeposit('');
    setMonthlyPledge('5000');
  };

  return (
    <div className="bg-white p-7 rounded-3xl shadow-xs">
      <h2 className="text-lg font-bold text-zinc-900 mb-1 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" /> New Savings Pot
      </h2>
      <p className="text-xs text-zinc-400 mb-6">Create a dedicated fund for a product</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="wishlistpotform-1" className="text-xs font-medium text-zinc-500 block mb-2">Item Name</label>
          <input id="wishlistpotform-1"
            type="text"
            required
            placeholder="e.g. Sony WH-1000XM5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-zinc-100 transition"
          />
        </div>

        <div>
          <label htmlFor="wishlistpotform-2" className="text-xs font-medium text-zinc-500 block mb-2">Target Cost (NPR)</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-xs text-zinc-400 font-semibold">Rs.</span>
            <input id="wishlistpotform-2"
              type="number" min="0.01" step="0.01"
              required
              placeholder="45000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-zinc-50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:bg-zinc-100 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="wishlistpotform-3" className="text-xs font-medium text-zinc-500 block mb-2">Initial Deposit</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-zinc-400 font-semibold">Rs.</span>
              <input id="wishlistpotform-3"
                type="number" min="0" step="0.01"
                placeholder="0"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full bg-zinc-50 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:bg-zinc-100 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="wishlistpotform-4" className="text-xs font-medium text-zinc-500 block mb-2">Monthly Contribution</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-zinc-400 font-semibold">Rs.</span>
              <input id="wishlistpotform-4"
                type="number" min="0" step="0.01"
                placeholder="5000"
                value={monthlyPledge}
                onChange={(e) => setMonthlyPledge(e.target.value)}
                className="w-full bg-zinc-50 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:bg-zinc-100 transition"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-xl text-sm transition mt-2 cursor-pointer"
        >
          Create Pot
        </button>
      </form>
    </div>
  );
}