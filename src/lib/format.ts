/** Formato de moneda mexicana: 1234.5 → "$1,234.50" */
export function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0)
}

/** Formato compacto para tarjetas grandes: 12500 → "$12,500" */
export function formatMoneyShort(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0)
}

/** Porcentaje: 0.42 → "42%" */
export function formatPercent(n: number): string {
  return `${Math.round((Number.isFinite(n) ? n : 0) * 100)}%`
}
