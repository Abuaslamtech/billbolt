import * as Crypto from 'expo-crypto';

/**
 * Business cycle calculations:
 * Every monthly cycle runs from the 14th of month M to the 13th of month M+1.
 * e.g., 2026-07-14 -> cycle starting 2026-07-14
 *       2026-07-10 -> cycle starting 2026-06-14
 */

export function parseDateSafe(dateInput?: string | Date | null): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? new Date() : dateInput;
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Match pure YYYY-MM-DD to avoid UTC midnight drift
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    // Convert space separator to 'T' for iOS WebKit/Hermes ISO-8601 compliance
    const isoCompatible = trimmed.includes(' ') && !trimmed.includes('T')
      ? trimmed.replace(' ', 'T')
      : trimmed;
    const parsed = new Date(isoCompatible);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date();
}

export function businessCycleStart(d: Date | string = new Date()): Date {
  const date = parseDateSafe(d);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  if (day >= 14) {
    return new Date(year, month, 14, 0, 0, 0, 0);
  } else {
    return new Date(year, month - 1, 14, 0, 0, 0, 0);
  }
}

export function cycleKey(d: Date | string = new Date()): string {
  const start = businessCycleStart(d);
  const end = cycleEnd(start);
  return `${formatYMD(start)}_${formatYMD(end)}`;
}

export function cycleEnd(start: Date): Date {
  const y = start.getFullYear();
  const m = start.getMonth();
  // End is the 13th of the following month
  return new Date(y, m + 1, 13, 23, 59, 59, 999);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function cycleLabel(start: Date | string): string {
  const d = parseDateSafe(start);
  const end = cycleEnd(d);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} - ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
}

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return prefix ? `${prefix}_${timestamp}${randomStr}` : `${timestamp}${randomStr}`;
}

export function formatYMD(d: Date | string = new Date()): string {
  const date = parseDateSafe(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateCleanReceiptNumber(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const rand = Array.from(Crypto.getRandomBytes(4), (b) =>
    b.toString(16).padStart(2, '0'),
  )
    .join('')
    .toUpperCase();
  return `BB-${yy}${mm}${dd}-${rand}`;
}

export function formatReceiptNo(
  receiptOrId: { id?: string; receiptNumber?: string } | string | null | undefined
): string {
  if (!receiptOrId) return 'BB-000000';

  if (typeof receiptOrId === 'string') {
    const raw = receiptOrId.trim();
    if (raw.startsWith('BB-')) return raw;
    if (raw.startsWith('#')) return `BB-${raw.slice(1)}`;
    if (raw.startsWith('No.')) return `BB-${raw.slice(3).trim()}`;
    // If it's a numeric 6-digit string
    if (/^\d{5,8}$/.test(raw)) return `BB-${raw}`;
    // If it's a long CUID or temp ID
    const clean = raw.replace(/^temp_rcpt_/, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return clean.length <= 6 ? `BB-${clean}` : `BB-RC-${clean.slice(-6)}`;
  }

  if (receiptOrId.receiptNumber) {
    const num = receiptOrId.receiptNumber.trim();
    if (num.startsWith('BB-')) return num;
    if (num.startsWith('#')) return `BB-${num.slice(1)}`;
    if (num.startsWith('No.')) return `BB-${num.slice(3).trim()}`;
    return `BB-${num}`;
  }

  if (receiptOrId.id) {
    const raw = receiptOrId.id.trim();
    if (/^\d{5,8}$/.test(raw)) return `BB-${raw}`;
    const clean = raw.replace(/^temp_rcpt_/, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return clean.length <= 6 ? `BB-${clean}` : `BB-RC-${clean.slice(-6)}`;
  }

  return 'BB-000000';
}

export function countTodayReceipts(receipts: { date?: string; createdAt?: string }[]): number {
  if (!receipts || receipts.length === 0) return 0;
  const todayStr = formatYMD(new Date());
  return receipts.filter((r) => {
    const d = r.date || r.createdAt;
    return d ? formatYMD(d) === todayStr : false;
  }).length;
}

