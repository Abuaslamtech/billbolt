import * as crypto from 'crypto';

/**
 * Generates a collision-resistant, date-encoded receipt number: BB-YYMMDD-XXXXXXXX
 * - 4 random bytes = 32 bits = 4,294,967,296 combinations per single calendar day.
 * - Pool resets automatically at midnight every 24 hours.
 * - Compatible with mobile client's formatReceiptNo('BB-*').
 */
export function generateReceiptNumber(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `BB-${yy}${mm}${dd}-${rand}`;
}
