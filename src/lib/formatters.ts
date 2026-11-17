/**
 * Formats a number into Indian Rupee currency format (e.g. ₹1,25,000)
 */
export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  
  // Using en-IN locale format with INR currency
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a raw number using the Indian comma system (e.g. 1,25,000)
 */
export function formatIndianNumber(value: number): string {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
}

/**
 * Calculates discount percentage
 */
export function calculateDiscount(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

