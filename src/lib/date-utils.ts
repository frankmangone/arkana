// Map our language codes to BCP 47 language tags
export const langMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-BR",
};

export function formatDate(date: Date, lang: string) {
  const dateString = date.toLocaleDateString(langMap[lang] || "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Capitalize first letter for Spanish and Portuguese
  if (lang === "es" || lang === "pt") {
    return dateString.charAt(0).toUpperCase() + dateString.slice(1);
  }

  return dateString;
}
