import { useAppDataStore } from "@/store/AppDataStore";
import { getCurrencySymbolFromCode, getDeviceLocale } from "@/lib/localization";

/**
 * Single source of truth for currency, date/time, and string formatting across Billbolt.
 */

export function getCurrencySymbol(currencyCodeOrSymbol?: string | null): string {
  if (currencyCodeOrSymbol) {
    return getCurrencySymbolFromCode(currencyCodeOrSymbol);
  }
  return getDeviceLocale().currencySymbol || "";
}

/**
 * Formats a number into clean currency (e.g. ₦1,600, ₦25,000, -₦1,000).
 * Handles signed negative zero (-0), NaN, and negative numbers cleanly.
 */
export function formatCurrency(n: number | null | undefined): string {
  const currencyCode = useAppDataStore.getState().businessInfo?.currency;
  const currencySymbol = getCurrencySymbol(currencyCode);
  if (n == null || isNaN(Number(n))) return `${currencySymbol}0`;
  const val = Number(n);
  if (Object.is(val, -0) || val === 0) return `${currencySymbol}0`;
  if (val < 0) {
    return `-${currencySymbol}${Math.abs(val).toLocaleString("en-NG")}`;
  }
  return `${currencySymbol}${val.toLocaleString("en-NG")}`;
}

/**
 * Formats a number with an explicit sign (+₦1,000, -₦1,000, or ₦0).
 */
export function formatSignedCurrency(n: number | null | undefined): string {
  const currencyCode = useAppDataStore.getState().businessInfo?.currency;
  const currencySymbol = getCurrencySymbol(currencyCode);
  if (n == null || isNaN(Number(n))) return `${currencySymbol}0`;
  const val = Number(n);
  if (Object.is(val, -0) || val === 0) return `${currencySymbol}0`;
  if (val < 0) {
    return `-${currencySymbol}${Math.abs(val).toLocaleString("en-NG")}`;
  }
  return `+${currencySymbol}${val.toLocaleString("en-NG")}`;
}

/**
 * Formats numeric input in real-time with thousand-separator commas (e.g. "15000" -> "15,000").
 * Preserves decimal points if allowed.
 */
export function formatNumberInput(value: string, allowDecimals: boolean = true): string {
  if (!value) return "";
  if (!allowDecimals) {
    const clean = value.replace(/\D/g, "");
    if (!clean) return "";
    const withoutLeadingZeros = clean.replace(/^0+(?=\d)/, "");
    return withoutLeadingZeros.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const clean = value.replace(/[^0-9.]/g, "");
  if (!clean) return "";
  const parts = clean.split(".");
  let intPart = parts[0].replace(/^0+(?=\d)/, "");
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (parts.length > 1) {
    return `${intPart || "0"}.${parts.slice(1).join("")}`;
  }
  return intPart;
}

/**
 * Parses comma-formatted numeric input strings safely into pure numbers.
 * Prevents the classic `parseFloat("1,000") === 1` JavaScript bug.
 */
export function parseNumberInput(value: string | null | undefined): number {
  if (!value) return 0;
  const clean = value.replace(/,/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats an ISO or timestamp date string into localized time (e.g. 02:45 PM).
 */
export function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const isoCompatible = dateStr.includes(" ") && !dateStr.includes("T")
      ? dateStr.trim().replace(" ", "T")
      : dateStr;
    const d = new Date(isoCompatible);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
