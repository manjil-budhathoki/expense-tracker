import WishlistPotCard from '../components/wishlist/WishlistPotCard';
import WishlistPotForm from '../components/wishlist/WishlistPotForm';
import LongTermSimulator from '../components/wishlist/LongTermSimulator';
import { useFinance } from '../context/FinanceContext';

export default function WishlistPage() {
  const { wishlistPots } = useFinance();

  return (
    <div className="space-y-10">
      {/* Active Individual Wishlist Pots */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Individual Savings Pots</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Each wish tracks its own deposits and independent monthly contribution.
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-semibold">{wishlistPots.length} pots active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <WishlistPotForm />
          </div>
          <div className="md:col-span-2 space-y-4">
            {wishlistPots.length === 0 && <div className="panel empty-state">What are you saving for? Create a pot to start tracking your progress.</div>}
            {wishlistPots.map((pot) => (
              <WishlistPotCard key={pot.id} pot={pot} />
            ))}
          </div>
        </div>
      </div>

      {/* Long-Term Life Goals (House, Land, Car) */}
      <div className="pt-2">
        <LongTermSimulator />
      </div>
    </div>
  );
}