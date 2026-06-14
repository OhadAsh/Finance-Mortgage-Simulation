export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact axis label for large values (e.g. ₪450K). */
export function formatCurrencyAxis(value: number): string {
  return `₪${Math.abs(value / 1000).toFixed(0)}K`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('he-IL', {
    maximumFractionDigits: 0,
  }).format(value);
}
