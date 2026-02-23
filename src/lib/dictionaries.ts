import enDictionary from "./dictionaries/en.json";
import { defaultLanguage, type Locale } from "./i18n-config";

export type Dictionary = typeof enDictionary;
export type AuthDictionary = Dictionary["auth"];

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  es: () => import("./dictionaries/es.json").then((module) => module.default),
  pt: () => import("./dictionaries/pt.json").then((module) => module.default),
};

function isLocale(value: string): value is Locale {
  return value in dictionaries;
}

export async function getDictionary(locale: string): Promise<Dictionary> {
  const normalizedLocale = isLocale(locale) ? locale : defaultLanguage;
  return dictionaries[normalizedLocale]();
}
