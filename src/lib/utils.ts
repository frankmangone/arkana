import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, lang: string) {
  // Parse as local date to avoid timezone issues
  // Split the date string and create a date object with local timezone
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day); // month is 0-indexed

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
