export const formatNPR = (amount) => {
  if (isNaN(amount) || amount === null) return 'Rs. 0';
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('NPR', 'Rs.');
};