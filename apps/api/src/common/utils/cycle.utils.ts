/**
 * Safely parses Date objects, ISO strings, or date-only "YYYY-MM-DD" strings.
 * For "YYYY-MM-DD", parses local calendar components to prevent ECMAScript UTC midnight
 * date rollback in western timezones.
 */
export function parseDateSafe(dateInput?: string | Date | null): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return new Date();
    // Match pure YYYY-MM-DD to avoid UTC midnight drift
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(trimmed);
  }
  return new Date();
}

export function formatYMD(d: Date | string = new Date()): string {
  let date = parseDateSafe(d);
  if (isNaN(date.getTime())) {
    date = new Date();
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Billing cycle: 14th of month M to 13th of month M+1 */
export function cycleKey(date: Date | string = new Date()): string {
  let d = parseDateSafe(date);
  if (isNaN(d.getTime())) {
    d = new Date();
  }
  const day = d.getDate();
  const m = d.getMonth();
  const y = d.getFullYear();
  if (day >= 14) {
    const start = new Date(y, m, 14);
    const end = new Date(y, m + 1, 13);
    return `${formatYMD(start)}_${formatYMD(end)}`;
  } else {
    const start = new Date(y, m - 1, 14);
    const end = new Date(y, m, 13);
    return `${formatYMD(start)}_${formatYMD(end)}`;
  }
}
