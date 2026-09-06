import * as Localization from "expo-localization";

export interface DeviceLocale {
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
}

export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
}

/**
 * Resolves currency symbol dynamically using native Intl API.
 * Zero hardcoded symbol dictionaries.
 */
export function getCurrencySymbolFromCode(currencyCode?: string | null): string {
  if (!currencyCode) return "";
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode.toUpperCase().trim(),
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value || currencyCode;
  } catch {
    return currencyCode;
  }
}

const intlCurrencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

/**
 * Dynamically resolves all official global currencies from the JavaScript runtime.
 * Zero hardcoded lists.
 */
function getAllGlobalCurrencies(): CurrencyItem[] {
  try {
    const codes = typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("currency")
      : [];

    return codes.map((code) => ({
      code,
      symbol: getCurrencySymbolFromCode(code),
      name: intlCurrencyNames.of(code) || code,
    }));
  } catch {
    return [];
  }
}

export const POPULAR_CURRENCIES: CurrencyItem[] = getAllGlobalCurrencies();

/**
 * Auto-detects device locale, country code, and currency directly from OS.
 * Zero hardcoded country defaults.
 */
export function getDeviceLocale(): DeviceLocale {
  const [device] = Localization.getLocales();

  const countryCode = device?.regionCode?.toUpperCase() || "";
  const currencyCode = device?.currencyCode?.toUpperCase() || "";
  const currencySymbol = device?.currencySymbol || getCurrencySymbolFromCode(currencyCode);
  const locale = device?.languageTag || "en";

  return {
    countryCode,
    currencyCode,
    currencySymbol,
    locale,
  };
}

