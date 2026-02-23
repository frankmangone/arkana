export const languages = ["en", "es", "pt"] as const;
export type Locale = (typeof languages)[number];

export const defaultLanguage: Locale = "en";
