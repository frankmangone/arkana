import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, lang: string) {
  const dateObj = new Date(date);

  try {
    // Format the date based on the language
    return dateObj.toLocaleDateString(lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    // Fallback to a default format if the locale isn't supported
    console.warn(
      `Locale '${lang}' not supported for date formatting, using default`
    );

    return dateObj.toLocaleDateString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}
