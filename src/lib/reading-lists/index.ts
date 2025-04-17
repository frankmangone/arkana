import * as en from "./en";
import * as es from "./es";
import * as pt from "./pt";

export * from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readingLists: Record<string, any> = {
  en,
  es,
  pt,
};
