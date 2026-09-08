/**
 * Calculates monthly savings capacity based on salary and allocation percentage.
 */
export function calculateSavingsCapacity(monthlySalary, allocationPercent) {
  return (monthlySalary * (allocationPercent || 0)) / 100;
}

/**
 * Calculates goal feasibility, timeline, and required income boost.
 * (Required by WishlistCard.jsx)
 */
export function calculateGoalProjections({ targetAmount, targetMonths, monthlyCapacity, allocationPercent }) {
  const safeMonths = Math.max(1, targetMonths || 1);
  const requiredMonthlySaving = (targetAmount || 0) / safeMonths;
  const safeCapacity = monthlyCapacity || 1;
  const monthsAtCurrentRate = ((targetAmount || 0) / safeCapacity).toFixed(1);
  const monthlyDeficit = requiredMonthlySaving - monthlyCapacity;

  // Extra gross monthly income required in NPR to meet target
  const safePercent = (allocationPercent || 25) / 100;
  const additionalIncomeNeeded = monthlyDeficit > 0 ? monthlyDeficit / safePercent : 0;

  return {
    requiredMonthlySaving,
    monthsAtCurrentRate,
    monthlyDeficit,
    additionalIncomeNeeded,
    isAchievable: monthlyDeficit <= 0,
  };
}

/**
 * Calculates remaining timeline and progress percentage for an active savings pot.
 * (Required by WishlistPotCard.jsx)
 */
export function calculatePotProgress({ targetAmount, currentSaved, monthlyCapacity }) {
  const remaining = Math.max(0, (targetAmount || 0) - (currentSaved || 0));
  const percentage = targetAmount > 0 
    ? Math.min(100, Math.round(((currentSaved || 0) / targetAmount) * 100))
    : 0;
  
  const safeCapacity = monthlyCapacity || 1;
  const monthsRemaining = monthlyCapacity > 0 
    ? (remaining / safeCapacity).toFixed(1) 
    : '∞';

  return {
    remaining,
    percentage,
    monthsRemaining,
    isCompleted: remaining <= 0,
  };
}

/**
 * Calculates long-term feasibility for big milestone dreams (House, Land, Car).
 * (Required by LongTermSimulator.jsx)
 */
export function calculateMilestoneHorizon(targetCost, projectedMonthlySalary, allocationPercent) {
  const projectedMonthlySaving = ((projectedMonthlySalary || 0) * (allocationPercent || 0)) / 100;
  if (projectedMonthlySaving <= 0) {
    return { monthlySavings: 0, totalMonths: Infinity, years: '∞' };
  }

  const totalMonths = (targetCost || 0) / projectedMonthlySaving;
  const years = (totalMonths / 12).toFixed(1);

  return {
    monthlySavings: projectedMonthlySaving,
    totalMonths: Math.ceil(totalMonths),
    years,
  };
}