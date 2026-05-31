/** World Bank awards are USD; display in INR for Indian users (approximate FX). */
const USD_TO_INR = 83

export function usdToInr(usd: number): number {
  return usd * USD_TO_INR
}

/** Format as INR crore/lakh; unknown or placeholder zero values stay unavailable. */
export function formatAwardInr(usd: number | null | undefined): string {
  if (usd === null || usd === undefined || !Number.isFinite(usd)) return 'Not Available'
  const inr = usdToInr(usd)
  if (!Number.isFinite(inr) || inr <= 0) return 'Not Available'
  if (inr >= 1e7) {
    const cr = inr / 1e7
    return `Rs ${cr >= 10 ? Math.round(cr) : cr.toFixed(1)} Cr`
  }
  if (inr >= 1e5) {
    const lakh = inr / 1e5
    return `Rs ${lakh >= 10 ? Math.round(lakh) : lakh.toFixed(1)} Lakh`
  }
  if (inr >= 1e3) {
    return `Rs ${Math.round(inr).toLocaleString('en-IN')}`
  }
  return `Rs ${inr.toFixed(0)}`
}
