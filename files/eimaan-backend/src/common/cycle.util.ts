/**
 * Eimaan Maison's "month" runs 14th to 13th, matching the monthly restock
 * schedule. This returns the first-of-calendar-month marker used to group
 * everything into that cycle (e.g. both 20 June and 5 July belong to the
 * cycle marked 2026-06-01, meaning "14 Jun – 13 Jul").
 */
export function businessCycleStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDate();
  const year = d.getFullYear();
  const month = d.getMonth();
  if (day < 14) {
    return new Date(Date.UTC(year, month - 1, 1));
  }
  return new Date(Date.UTC(year, month, 1));
}

export function cycleLabel(cycleStart: Date): string {
  const start14 = new Date(cycleStart);
  start14.setUTCDate(14);
  const end = new Date(cycleStart);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(13);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(start14)} - ${fmt(end)}`;
}

export function quarterIndex(cycleStart: Date, firstCycle: Date): number {
  return Math.floor(monthsBetween(firstCycle, cycleStart) / 3) + 1;
}

export function halfIndex(cycleStart: Date, firstCycle: Date): number {
  return Math.floor(monthsBetween(firstCycle, cycleStart) / 6) + 1;
}

export function yearIndex(cycleStart: Date, firstCycle: Date): number {
  return Math.floor(monthsBetween(firstCycle, cycleStart) / 12) + 1;
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
}
