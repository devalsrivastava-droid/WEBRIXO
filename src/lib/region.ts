/**
 * Where is this visitor, roughly, and what should we quote them in?
 *
 * Deliberately NOT the Geolocation API: that throws a permission prompt, needs
 * a reason we don't have, and gives us street-level data we'd then be storing.
 * The browser's timezone and language are already sent by every visitor, need
 * no consent, identify no one, and answer the only question we actually have —
 * "which currency and phone format should this page use?"
 *
 * Inference is never certain, so a manual switcher always wins and is
 * remembered.
 */

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "AUD" | "CAD" | "SGD";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  /** Smallest billable unit per major unit (paise, cents…). */
  minor: number;
  /** Round displayed prices to this step so we never show 74,912. */
  step: number;
  /** Multiplier applied to the INR base price. Set these to your real prices. */
  rate: number;
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  INR: { code: "INR", symbol: "₹", label: "Indian rupee", minor: 100, step: 500, rate: 1 },
  USD: { code: "USD", symbol: "$", label: "US dollar", minor: 100, step: 25, rate: 0.0145 },
  EUR: { code: "EUR", symbol: "€", label: "Euro", minor: 100, step: 25, rate: 0.0134 },
  GBP: { code: "GBP", symbol: "£", label: "Pound sterling", minor: 100, step: 25, rate: 0.0115 },
  AED: { code: "AED", symbol: "AED ", label: "UAE dirham", minor: 100, step: 50, rate: 0.053 },
  AUD: { code: "AUD", symbol: "A$", label: "Australian dollar", minor: 100, step: 25, rate: 0.022 },
  CAD: { code: "CAD", symbol: "C$", label: "Canadian dollar", minor: 100, step: 25, rate: 0.02 },
  SGD: { code: "SGD", symbol: "S$", label: "Singapore dollar", minor: 100, step: 25, rate: 0.019 },
};

/** Timezone prefixes → currency. Ordered from most specific to least. */
const ZONE_RULES: [string, CurrencyCode][] = [
  ["Asia/Kolkata", "INR"], ["Asia/Calcutta", "INR"],
  ["Asia/Dubai", "AED"], ["Asia/Muscat", "AED"], ["Asia/Qatar", "AED"], ["Asia/Riyadh", "AED"],
  ["Asia/Singapore", "SGD"], ["Asia/Kuala_Lumpur", "SGD"],
  ["Europe/London", "GBP"], ["Europe/Dublin", "EUR"], ["Europe/", "EUR"],
  ["Australia/", "AUD"], ["Pacific/Auckland", "AUD"],
  ["America/Toronto", "CAD"], ["America/Vancouver", "CAD"], ["America/Edmonton", "CAD"], ["America/Winnipeg", "CAD"], ["America/Halifax", "CAD"],
  ["America/", "USD"], ["US/", "USD"], ["Canada/", "CAD"],
];

/** Locale region subtags → currency, used when the timezone is unhelpful. */
const REGION_RULES: Record<string, CurrencyCode> = {
  IN: "INR", US: "USD", CA: "CAD", GB: "GBP", IE: "EUR", AU: "AUD", NZ: "AUD",
  AE: "AED", SA: "AED", QA: "AED", OM: "AED", SG: "SGD", MY: "SGD",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", PT: "EUR", FI: "EUR", GR: "EUR",
};

const STORE_KEY = "webrixo-currency";

function timeZone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { return ""; }
}

function localeRegion(): string {
  try {
    const tag = (navigator.languages?.[0] || navigator.language || "").toUpperCase();
    const m = tag.match(/[-_]([A-Z]{2})\b/);
    if (m) return m[1];
    return "";
  } catch { return ""; }
}

/** Best guess at the visitor's currency. Never throws, always returns something. */
export function detectCurrency(): CurrencyCode {
  const tz = timeZone();
  for (const [prefix, code] of ZONE_RULES) {
    if (tz === prefix || tz.startsWith(prefix)) return code;
  }
  const region = localeRegion();
  if (region && REGION_RULES[region]) return REGION_RULES[region];
  return "USD";
}

/** Stored override, if the visitor picked one. */
export function storedCurrency(): CurrencyCode | null {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v && v in CURRENCIES ? (v as CurrencyCode) : null;
  } catch { return null; }
}

export function rememberCurrency(code: CurrencyCode) {
  try { localStorage.setItem(STORE_KEY, code); } catch { /* private mode */ }
}

/** True when the visitor is somewhere we bill locally rather than converting. */
export function isHomeMarket(code: CurrencyCode) {
  return code === "INR";
}

/**
 * Convert a base (INR) price and round it to something a human would quote.
 * Returns the display string and the integer minor-unit amount a payment
 * provider needs (paise, cents…).
 */
export function convert(baseInr: number, code: CurrencyCode) {
  const c = CURRENCIES[code];
  const raw = baseInr * c.rate;
  const rounded = Math.max(c.step, Math.round(raw / c.step) * c.step);
  return {
    amount: rounded,
    minorAmount: Math.round(rounded * c.minor),
    display: format(rounded, code),
    currency: c,
  };
}

/**
 * Pin a locale per currency rather than trusting the visitor's. Grouping and
 * symbol placement are properties of the money, not of the reader, and some
 * browsers fall back to a locale that drops separators entirely (₹20000).
 */
const LOCALE_FOR: Record<CurrencyCode, string> = {
  INR: "en-IN", USD: "en-US", EUR: "en-IE", GBP: "en-GB",
  AED: "en-AE", AUD: "en-AU", CAD: "en-CA", SGD: "en-SG",
};

export function format(amount: number, code: CurrencyCode) {
  const c = CURRENCIES[code];
  try {
    const out = new Intl.NumberFormat(LOCALE_FOR[code] ?? "en-US", {
      style: "currency", currency: code, currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0, minimumFractionDigits: 0, useGrouping: true,
    }).format(amount).replace(/\u00a0/g, "");
    // If the runtime still gave us an ungrouped number, group it ourselves.
    if (amount >= 1000 && !/[.,\s]/.test(out)) {
      return c.symbol + groupDigits(amount, code);
    }
    return out;
  } catch {
    return c.symbol + groupDigits(amount, code);
  }
}

/** Indian grouping is 2,2,3 from the right; everywhere else here is 3s. */
function groupDigits(amount: number, code: CurrencyCode) {
  const n = Math.round(amount).toString();
  if (code !== "INR") return n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (n.length <= 3) return n;
  const last3 = n.slice(-3);
  const rest = n.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

/** A short, human label for where we think they are, used in the switcher. */
export function regionLabel(code: CurrencyCode) {
  switch (code) {
    case "INR": return "India";
    case "GBP": return "United Kingdom";
    case "EUR": return "Europe";
    case "AED": return "Middle East";
    case "AUD": return "Australia";
    case "CAD": return "Canada";
    case "SGD": return "Singapore";
    default: return "United States";
  }
}

/* ── Countries ──────────────────────────────────────────────────────────────
   Enough of the world to be useful without a 250-row dropdown nobody scrolls.
   "Somewhere else" keeps the honest answer available. */

export type Country = { code: string; name: string; currency: CurrencyCode; dial: string };

export const COUNTRIES: Country[] = [
  { code: "IN", name: "India", currency: "INR", dial: "+91" },
  { code: "US", name: "United States", currency: "USD", dial: "+1" },
  { code: "GB", name: "United Kingdom", currency: "GBP", dial: "+44" },
  { code: "CA", name: "Canada", currency: "CAD", dial: "+1" },
  { code: "AU", name: "Australia", currency: "AUD", dial: "+61" },
  { code: "NZ", name: "New Zealand", currency: "AUD", dial: "+64" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", currency: "AED", dial: "+966" },
  { code: "QA", name: "Qatar", currency: "AED", dial: "+974" },
  { code: "SG", name: "Singapore", currency: "SGD", dial: "+65" },
  { code: "MY", name: "Malaysia", currency: "SGD", dial: "+60" },
  { code: "DE", name: "Germany", currency: "EUR", dial: "+49" },
  { code: "FR", name: "France", currency: "EUR", dial: "+33" },
  { code: "ES", name: "Spain", currency: "EUR", dial: "+34" },
  { code: "IT", name: "Italy", currency: "EUR", dial: "+39" },
  { code: "NL", name: "Netherlands", currency: "EUR", dial: "+31" },
  { code: "IE", name: "Ireland", currency: "EUR", dial: "+353" },
  { code: "PT", name: "Portugal", currency: "EUR", dial: "+351" },
  { code: "SE", name: "Sweden", currency: "EUR", dial: "+46" },
  { code: "ZA", name: "South Africa", currency: "USD", dial: "+27" },
  { code: "NG", name: "Nigeria", currency: "USD", dial: "+234" },
  { code: "KE", name: "Kenya", currency: "USD", dial: "+254" },
  { code: "BR", name: "Brazil", currency: "USD", dial: "+55" },
  { code: "MX", name: "Mexico", currency: "USD", dial: "+52" },
  { code: "JP", name: "Japan", currency: "USD", dial: "+81" },
  { code: "XX", name: "Somewhere else", currency: "USD", dial: "" },
];

/** Timezones that pin a country exactly, checked before the looser locale guess. */
const ZONE_COUNTRY: [string, string][] = [
  ["Asia/Kolkata", "IN"], ["Asia/Calcutta", "IN"],
  ["Asia/Dubai", "AE"], ["Asia/Riyadh", "SA"], ["Asia/Qatar", "QA"],
  ["Asia/Singapore", "SG"], ["Asia/Kuala_Lumpur", "MY"], ["Asia/Tokyo", "JP"],
  ["Europe/London", "GB"], ["Europe/Dublin", "IE"], ["Europe/Berlin", "DE"],
  ["Europe/Paris", "FR"], ["Europe/Madrid", "ES"], ["Europe/Rome", "IT"],
  ["Europe/Amsterdam", "NL"], ["Europe/Lisbon", "PT"], ["Europe/Stockholm", "SE"],
  ["Australia/", "AU"], ["Pacific/Auckland", "NZ"],
  ["America/Toronto", "CA"], ["America/Vancouver", "CA"], ["America/Edmonton", "CA"], ["America/Winnipeg", "CA"], ["America/Halifax", "CA"],
  ["America/Sao_Paulo", "BR"], ["America/Mexico_City", "MX"],
  ["Africa/Johannesburg", "ZA"], ["Africa/Lagos", "NG"], ["Africa/Nairobi", "KE"],
  ["America/", "US"], ["US/", "US"],
];

/** Best guess at the visitor's country code. Always returns a code we know. */
export function detectCountry(): string {
  const tz = timeZone();
  for (const [prefix, code] of ZONE_COUNTRY) {
    if (tz === prefix || tz.startsWith(prefix)) return code;
  }
  const region = localeRegion();
  if (region && COUNTRIES.some(c => c.code === region)) return region;
  return "XX";
}

export function countryByCode(code: string): Country {
  return COUNTRIES.find(c => c.code === code) ?? COUNTRIES[COUNTRIES.length - 1];
}

/** The raw signals we'd store on a profile, all already sent by every browser. */
export function localeSignals() {
  return {
    timezone: timeZone(),
    locale: (typeof navigator !== "undefined" && (navigator.languages?.[0] || navigator.language)) || "",
  };
}

/** "6:42 pm in Asia/Kolkata" — used to show people what we actually inferred. */
export function localTimeIn(zone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: zone || undefined }).format(new Date());
  } catch { return ""; }
}
