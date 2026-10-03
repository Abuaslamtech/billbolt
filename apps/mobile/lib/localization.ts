import * as Localization from "expo-localization";
import rawCurrencies from "@/data/currencies.json";

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
  country?: string;
  countries?: string[];
  timezones?: string[];
}

export const POPULAR_CURRENCIES: CurrencyItem[] = rawCurrencies as CurrencyItem[];

const SYMBOL_BY_CODE: Record<string, string> = {};
const TIMEZONE_TO_CURRENCY: Record<string, { country: string; currency: string }> = {};
const COUNTRY_TO_CURRENCY: Record<string, string> = {};

// Build high-performance in-memory lookup indexes from consolidated currencies.json
for (let i = 0; i < POPULAR_CURRENCIES.length; i++) {
  const item = POPULAR_CURRENCIES[i];
  SYMBOL_BY_CODE[item.code] = item.symbol;

  if (item.countries) {
    for (const c of item.countries) {
      if (!COUNTRY_TO_CURRENCY[c]) {
        COUNTRY_TO_CURRENCY[c] = item.code;
      }
    }
  }
  if (item.timezones) {
    const primaryCountry = item.countries?.[0] || "NG";
    for (const tz of item.timezones) {
      TIMEZONE_TO_CURRENCY[tz] = {
        country: primaryCountry,
        currency: item.code,
      };
    }
  }
}

/**
 * Resolves currency symbol dynamically from verified dataset or fallback.
 * Safe for all React Native JS runtimes including Hermes on Android.
 */
export function getCurrencySymbolFromCode(currencyCode?: string | null): string {
  if (!currencyCode) return "";
  const code = currencyCode.toUpperCase().trim();
  if (SYMBOL_BY_CODE[code]) {
    return SYMBOL_BY_CODE[code];
  }
  try {
    if (typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function") {
      const formatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
      });
      if (typeof formatter.formatToParts === "function") {
        const parts = formatter.formatToParts(0);
        const symbolPart = parts.find((p) => p.type === "currency");
        if (symbolPart?.value) return symbolPart.value;
      }
    }
  } catch {
    // Fall back to currency code
  }
  return currencyCode;
}

/**
 * Auto-detects device locale, country code, and currency directly from OS.
 */
export function getDeviceLocale(): DeviceLocale {
  try {
    const locales = Localization.getLocales();
    const calendars = Localization.getCalendars?.() || [];
    const device = locales && locales.length > 0 ? locales[0] : null;

    // Get device timezone from calendars or Intl
    let timeZone = calendars[0]?.timeZone || "";
    if (!timeZone) {
      try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      } catch {
        // Ignore fallback
      }
    }

    let countryCode = "";
    let currencyCode = "";

    // 1. PRIMARY SIGNAL: Device Timezone (auto-synced with local SIM/cell towers)
    if (timeZone && TIMEZONE_TO_CURRENCY[timeZone]) {
      const tzMatch = TIMEZONE_TO_CURRENCY[timeZone];
      countryCode = tzMatch.country;
      currencyCode = tzMatch.currency;
    }

    // 2. SECONDARY SIGNAL: If timezone is generic (e.g. UTC, GMT), use OS locale/region
    if (!currencyCode) {
      countryCode = device?.regionCode?.toUpperCase() || "";
      currencyCode = device?.currencyCode?.toUpperCase() || "";

      if (!currencyCode && countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
        currencyCode = COUNTRY_TO_CURRENCY[countryCode];
      }
    }

    // 3. FINAL DEFAULT: Nigeria / NGN
    if (!currencyCode) {
      currencyCode = "NGN";
      countryCode = countryCode || "NG";
    }

    const currencySymbol = getCurrencySymbolFromCode(currencyCode);
    const locale = device?.languageTag || "en";

    return {
      countryCode,
      currencyCode,
      currencySymbol,
      locale,
    };
  } catch {
    return {
      countryCode: "NG",
      currencyCode: "NGN",
      currencySymbol: "₦",
      locale: "en",
    };
  }
}

