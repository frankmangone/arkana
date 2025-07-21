import { readingLists as en } from "./en";
import { readingLists as es } from "./es";
import { readingLists as pt } from "./pt";
import { ReadingList } from "./types";

export * from "./types";
export * from "./fetch";

export const readingLists: Record<string, ReadingList[]> = {
  en,
  es,
  pt,
};
