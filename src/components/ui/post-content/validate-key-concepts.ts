import { extractCards } from "@/lib/agent-content/key-concepts-markdown";

// A key-concepts deck is a recap, so it must be the very last block of a post:
// at most one per post, and nothing but whitespace after its closing </div>.
// Its cards must also be short, so they fit on a phone screen without scrolling.

const OPENING_TAG =
  /<div\b[^>]*\bclass\s*=\s*["'][^"']*\bkey-concepts\b[^"']*["'][^>]*>/g;
const ANY_DIV_TAG = /<div\b[^>]*>|<\/div\s*>/g;

// Blank out code (fenced blocks and inline spans) so a post that *shows* the
// syntax in an example isn't mistaken for one that uses it. Length is kept, so
// offsets still line up with the original text.
function maskCode(content: string): string {
  const blank = (match: string) => match.replace(/[^\n]/g, " ");
  return content
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?\n\1[^\n]*$/gm, blank)
    .replace(/`[^`\n]*`/g, blank);
}

export function assertKeyConceptsLast(content: string, postTitle = "post") {
  const masked = maskCode(content);
  const openings = [...masked.matchAll(OPENING_TAG)];
  if (openings.length === 0) return;

  const fail = (reason: string): never => {
    throw new Error(`Key concepts in "${postTitle}": ${reason}`);
  };

  if (openings.length > 1) {
    fail(`found ${openings.length} decks, but a post can have only one.`);
  }

  const opening = openings[0];
  const afterOpening = opening.index + opening[0].length;

  // Walk to the matching </div>, accounting for the nested concept divs.
  let depth = 1;
  let end = -1;
  ANY_DIV_TAG.lastIndex = afterOpening;
  for (
    let tag = ANY_DIV_TAG.exec(masked);
    tag;
    tag = ANY_DIV_TAG.exec(masked)
  ) {
    depth += tag[0].startsWith("</") ? -1 : 1;
    if (depth === 0) {
      end = tag.index + tag[0].length;
      break;
    }
  }
  if (end === -1) fail('the <div class="key-concepts"> block is never closed.');

  const trailing = masked.slice(end).trim();
  if (trailing !== "") {
    fail(
      `the deck must be the last block of the post, but this follows it: "${trailing.slice(0, 60)}${trailing.length > 60 ? "…" : ""}"`
    );
  }
}

/**
 * The most text a card's body may hold, in characters. Counted in characters
 * rather than words because languages differ (Spanish runs longer than English).
 * Raise it if cards turn out to have room to spare.
 */
export const MAX_CARD_CHARS = 450;

// A display equation takes up room on a card, but its source isn't a fair
// measure of it, so each one counts as this many characters.
const DISPLAY_MATH_CHARS = 100;

/** How much room a card's body takes up: its title doesn't count. */
export function cardTextLength(card: string): number {
  const display = card.match(/\$\$[\s\S]*?\$\$/g)?.length ?? 0;
  const text = card
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/^#{1,6}[ \t]+.*$/m, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|\*|`)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length + display * DISPLAY_MATH_CHARS;
}

export function assertCardsFit(deck: string, postTitle = "post") {
  // Every offender is reported at once, so they can all be fixed in one go.
  const tooLong = extractCards(deck).flatMap((card) => {
    const length = cardTextLength(card);
    if (length <= MAX_CARD_CHARS) return [];
    const title =
      card.match(/^#{1,6}[ \t]+(.*)$/m)?.[1]?.trim() ?? card.slice(0, 30);
    return [`  - "${title}": ${length} characters`];
  });
  if (tooLong.length === 0) return;

  throw new Error(
    `Key concepts in "${postTitle}": a card can hold at most ${MAX_CARD_CHARS} characters, so trim these, or split them into more cards:\n${tooLong.join("\n")}`
  );
}

const TAB_WIDTH = 4;

// A line's leading whitespace, with tabs counted as TAB_WIDTH spaces.
const expandIndent = (line: string) =>
  line.replace(/^[ \t]*/, (indent) =>
    indent.replace(/\t/g, " ".repeat(TAB_WIDTH))
  );

/**
 * Gets the deck into a shape markdown will parse, however it's written.
 *
 * - Indentation: markdown treats a line indented four or more spaces as a code
 *   block, so an indented deck would come out as literal code. The deck's own
 *   <div> lines lose all their indentation, and each card's content loses the
 *   indentation of its least-indented line, so what's indented further (a
 *   nested list, say) keeps its relative indentation.
 * - Blank lines: an HTML block runs until the next blank line, and its content
 *   is passed through as raw HTML, not markdown. So without a blank line after
 *   each <div> and before each </div>, the whole deck is one raw block and
 *   every `####`, `**bold**` and `$$` in it shows up as literal text. They're
 *   added where missing (and likewise around `$$` equations, so they're parsed
 *   as blocks).
 */
function dedentDeck(deck: string): string {
  const out: string[] = [];
  // Adds a line, but never two blank lines in a row (or one at the very start).
  const push = (line: string) => {
    if (line === "" && (out.length === 0 || out[out.length - 1] === "")) return;
    out.push(line);
  };

  let depth = 0; // 0: outside, 1: in the deck, 2: in a card, 3+: in a div inside a card
  let card: string[] = [];

  const flushCard = () => {
    const indents = card
      .filter((line) => line.trim() !== "")
      .map((line) => expandIndent(line).search(/\S/));
    const strip = indents.length ? Math.min(...indents) : 0;

    let inMath = false;
    for (const raw of card) {
      const line = raw.trim() === "" ? "" : expandIndent(raw).slice(strip);
      if (line.trim() === "$$") {
        // A display equation's fences, kept apart from the text around them.
        if (!inMath) push("");
        push(line);
        if (inMath) push("");
        inMath = !inMath;
      } else {
        push(line);
      }
    }
    card = [];
  };

  for (const line of deck.split("\n")) {
    const opens = (line.match(/<div\b[^>]*>/g) ?? []).length;
    const closes = (line.match(/<\/div\s*>/g) ?? []).length;
    const onlyOpener = opens === 1 && /^\s*<div\b[^>]*>\s*$/.test(line);
    const onlyCloser = closes === 1 && /^\s*<\/div\s*>\s*$/.test(line);

    if (onlyOpener && depth <= 1) {
      // The deck's or a card's opening tag.
      push("");
      push(line.trim());
      push("");
      depth += 1;
    } else if (onlyCloser && depth <= 2) {
      // The deck's or a card's closing tag.
      if (depth === 2) flushCard();
      push("");
      push(line.trim());
      push("");
      depth -= 1;
    } else {
      // Card content (including any divs of its own), or a stray line.
      if (depth >= 2) card.push(line);
      else push(line.trimStart());
      depth += opens - closes;
    }
  }
  flushCard();

  while (out[out.length - 1] === "") out.pop();
  return out.join("\n");
}

/**
 * Splits a post into its article text and its key-concepts deck (null if it has
 * none). The deck is shown in a modal from the hero, not inline, so the two
 * are rendered separately. Throws if the deck isn't the last block, which also
 * guarantees everything from its opening tag onwards is the deck. Also throws
 * if a card is too long to read comfortably on a phone.
 */
export function splitKeyConcepts(
  content: string,
  postTitle?: string
): { body: string; deck: string | null } {
  assertKeyConceptsLast(content, postTitle);

  const opening = maskCode(content).match(new RegExp(OPENING_TAG.source));
  if (!opening || opening.index === undefined) {
    return { body: content, deck: null };
  }
  const deck = dedentDeck(content.slice(opening.index).trim());
  assertCardsFit(deck, postTitle);
  return { body: content.slice(0, opening.index).trimEnd(), deck };
}
