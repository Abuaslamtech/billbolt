import { useAppDataStore } from "@/store/AppDataStore";

/**
 * Single source of truth for currency, date/time, and string formatting across Billbolt.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  GHS: "₵",
  KES: "KSh",
};

export function getCurrencySymbol(currencyCodeOrSymbol?: string | null): string {
  if (!currencyCodeOrSymbol) return "₦";
  // If it's already a symbol (e.g., ₦), CURRENCY_SYMBOLS won't match and we'll just return it.
  return CURRENCY_SYMBOLS[currencyCodeOrSymbol.toUpperCase()] || currencyCodeOrSymbol;
}

/**
 * Formats a number into clean, unrounded currency (e.g. ₦1,600, ₦25,000).
 */
export function formatCurrency(n: number | null | undefined): string {
  const currencyCode = useAppDataStore.getState().businessInfo?.currency;
  const currencySymbol = getCurrencySymbol(currencyCode);
  if (n == null || isNaN(Number(n))) return `${currencySymbol}0`;
  return `${currencySymbol}${Number(n).toLocaleString("en-NG")}`;
}

/**
 * Formats an ISO or timestamp date string into localized time (e.g. 02:45 PM).
 */
export function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

/**
 * Formats payment method identifiers into clean Title Case (e.g. "cash" -> "Cash").
 */
export function formatPaymentMethod(method?: string | null): string {
  if (!method) return "";
  return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
}
