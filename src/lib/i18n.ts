// Shared i18n config (importierbar von Client- und Server-Code)

export const locales = ["de", "en", "tr", "ar", "uk", "pl", "ro", "fa", "ru", "zh", "sr", "hr", "bg", "fr", "es", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export const hasLocale = (locale: string): locale is Locale =>
  locales.includes(locale as Locale);

export const rtlLocales: Locale[] = ["ar", "fa"];
export const isRtl = (locale: Locale) => rtlLocales.includes(locale);
