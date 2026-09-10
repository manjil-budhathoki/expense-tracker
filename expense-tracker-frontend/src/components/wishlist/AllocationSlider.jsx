import { useFinance } from '../../context/FinanceContext';
import { formatNPR } from '../../utils/currency';
import mockData from '../../data/mockData.json';

export default function AllocationSlider() {
  const { allocationPercent, setAllocationPercent, monthlySavingsCapacity } = useFinance();
  const bounds = mockData.sliderBounds.allocation;

  return (
    <div className="bg-white p-7 rounded-3xl shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Salary Savings Ratio</h2>
          <p className="text-xs text-zinc-400">Portion of monthly income dedicated to buying wishlist goals</p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs text-zinc-400 block">Monthly Savings Power</span>
          <span className="text-lg font-bold text-emerald-600">
            {formatNPR(monthlySavingsCapacity)}
          </span>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex justify-between text-xs font-semibold text-zinc-500 mb-2">
          <span>{bounds.min}%</span>
          <span className="text-zinc-900 font-bold text-sm">{allocationPercent}% of Salary</span>
          <span>{bounds.max}%</span>
        </div>
        <input
          type="range"
          min={String(bounds.min)}
          max={String(bounds.max)}
          step={String(bounds.step)}
          value={allocationPercent}
          onChange={(e) => setAllocationPercent(Number(e.target.value))}
          className="w-full accent-zinc-900 h-2 bg-zinc-100 rounded-lg cursor-pointer appearance-none"
        />
      </div>
    </div>
  );
}