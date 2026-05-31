/** World Bank awards are USD; display in INR for Indian users (approximate FX). */
const USD_TO_INR = 83

export function usdToInr(usd: number): number {
  return usd * USD_TO_INR
}

/** Format as ₹12.6 Cr, ₹8.3 Lakh, etc. */
export function formatAwardInr(usd: number): string {
  const inr = usdToInr(usd)
  if (!Number.isFinite(inr) || inr <= 0) return '₹0'
  if (inr >= 1e7) {
    const cr = inr / 1e7
    return `₹${cr >= 10 ? Math.round(cr) : cr.toFixed(1)} Cr`
  }
  if (inr >= 1e5) {
    const lakh = inr / 1e5
    return `₹${lakh >= 10 ? Math.round(lakh) : lakh.toFixed(1)} Lakh`
  }
  if (inr >= 1e3) {
    return `₹${Math.round(inr).toLocaleString('en-IN')}`
  }
  return `₹${inr.toFixed(0)}`
}
