// Currency Formatter for ModoTech (BDT - Bangladeshi Taka)
export const formatBDT = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '৳0';
  return `৳${Math.round(Number(amount)).toLocaleString('en-US')}`;
};

export default formatBDT;

