export const formatNPR = (amount) => {
  if (isNaN(amount) || amount === null) return 'Rs. 0';
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('NPR', 'Rs.');
};