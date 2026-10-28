import matter from "gray-matter";

// YAML parses an unquoted `date: 2024-03-18` into a JS Date (UTC midnight),
// while `date: '2024-03-18'` stays a string. Everything downstream (formatDate,
// JSON-LD, RSS, ...) expects the string form, so normalize it here instead of
// relying on authors to remember the quotes.
export function parseFrontmatter(fileContent: string) {
  const parsed = matter(fileContent);

  if (parsed.data.date instanceof Date) {
    parsed.data.date = parsed.data.date.toISOString().slice(0, 10);
  }

  return parsed;
}
