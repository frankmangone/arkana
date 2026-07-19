import { ReadingList } from "./types";
import { getAllReadingListsForLang } from "./data";

export * from "./types";
export * from "./fetch";

const SUPPORTED_LANGS = ["en", "es", "pt"];

export const readingLists: Record<string, ReadingList[]> = Object.fromEntries(
  SUPPORTED_LANGS.map((lang) => [lang, getAllReadingListsForLang(lang)])
);
