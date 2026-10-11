/**
 * Single source of truth for currency and date formatting across Billbolt Admin.
 * Mirrors apps/mobile/lib/formatters.ts
 */

export function formatCurrency(n: number | null | undefined, currencySymbol: string = '₦'): string {
  if (n == null || isNaN(Number(n))) return `${currencySymbol}0`;
  const val = Number(n);
  if (Object.is(val, -0) || val === 0) return `${currencySymbol}0`;
  if (val < 0) {
    return `-${currencySymbol}${Math.abs(val).toLocaleString('en-NG')}`;
  }
  return `${currencySymbol}${val.toLocaleString('en-NG')}`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return '0';
  return Number(n).toLocaleString('en-NG');
}

export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
