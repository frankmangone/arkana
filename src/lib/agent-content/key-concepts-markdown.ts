const DIV_TAG = /<div\b([^>]*)>|<\/div\s*>/g;
const hasClass = (attributes: string, name: string) => {
  const classes = attributes.match(/\bclass="([^"]*)"/)?.[1] ?? "";
  return classes.split(/\s+/).includes(name);
};

/**
 * Turns a key-concepts deck (the `<div class="key-concepts">` block that ends
 * a post, as returned by `splitKeyConcepts`) into plain markdown: one `###`
 * section per card, under a `##` heading. Returns "" if there are no cards.
 */
export function deckToMarkdown(deck: string, heading: string): string {
  const cards: string[] = [];
  let depth = 0; // 1 = inside the deck, 2 = inside a card
  let cardStart = -1;

  for (const match of deck.matchAll(DIV_TAG)) {
    const isOpening = match[0][1] !== "/";
    if (isOpening) {
      depth++;
      if (depth === 2 && hasClass(match[1] ?? "", "concept")) {
        cardStart = match.index + match[0].length;
      }
    } else {
      if (depth === 2 && cardStart >= 0) {
        cards.push(deck.slice(cardStart, match.index));
        cardStart = -1;
      }
      depth--;
    }
  }

  const sections = cards
    .map((card) => card.trim())
    // A card's title is an `####`; one level down from the section heading.
    .map((card) => card.replace(/^#{1,6}[ \t]+/, "### "))
    .filter(Boolean);
  if (sections.length === 0) return "";
  return `## ${heading}\n\n${sections.join("\n\n")}`;
}
