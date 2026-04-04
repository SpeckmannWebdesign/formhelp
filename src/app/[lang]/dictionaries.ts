import "server-only";

const dictionaries = {
  de: () => import("./dictionaries/de.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  tr: () => import("./dictionaries/tr.json").then((module) => module.default),
  ar: () => import("./dictionaries/ar.json").then((module) => module.default),
  uk: () => import("./dictionaries/uk.json").then((module) => module.default),
  pl: () => import("./dictionaries/pl.json").then((module) => module.default),
  ro: () => import("./dictionaries/ro.json").then((module) => module.default),
  fa: () => import("./dictionaries/fa.json").then((module) => module.default),
  ru: () => import("./dictionaries/ru.json").then((module) => module.default),
  zh: () => import("./dictionaries/zh.json").then((module) => module.default),
  sr: () => import("./dictionaries/sr.json").then((module) => module.default),
  hr: () => import("./dictionaries/hr.json").then((module) => module.default),
  bg: () => import("./dictionaries/bg.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
  it: () => import("./dictionaries/it.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;
export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[Locale]>>;

export const locales: Locale[] = ["de", "en", "tr", "ar", "uk", "pl", "ro", "fa", "ru", "zh", "sr", "hr", "bg", "fr", "es", "it"];
export const defaultLocale: Locale = "de";

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export const rtlLocales: Locale[] = ["ar", "fa"];
export const isRtl = (locale: Locale) => rtlLocales.includes(locale);

export const localeNames: Record<Locale, string> = {
  de: "Deutsch", en: "English", tr: "Türkçe", ar: "العربية", uk: "Українська",
  pl: "Polski", ro: "Română", fa: "فارسی", ru: "Русский",
  zh: "中文", sr: "Српски", hr: "Hrvatski", bg: "Български", fr: "Français", es: "Español", it: "Italiano",
};

export const localeLanguageNames: Record<Locale, string> = {
  de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", uk: "Ukrainisch",
  pl: "Polnisch", ro: "Rumänisch", fa: "Persisch", ru: "Russisch",
  zh: "Chinesisch", sr: "Serbisch", hr: "Kroatisch", bg: "Bulgarisch", fr: "Französisch", es: "Spanisch", it: "Italienisch",
};
