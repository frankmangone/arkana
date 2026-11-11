import { describe, expect, it } from "vitest";
import {
  assertKeyConceptsLast,
  splitKeyConcepts,
} from "./validate-key-concepts";

const deck = `<div class="key-concepts" data-title="Key concepts">

<div class="concept">

#### One
Body.

</div>

<div class="concept">

#### Two
Body.

</div>

</div>`;

describe("assertKeyConceptsLast", () => {
  it("accepts a post without a deck", () => {
    expect(() =>
      assertKeyConceptsLast("Just text.\n\n## A heading")
    ).not.toThrow();
  });

  it("accepts a deck that is the last block, with trailing whitespace", () => {
    expect(() =>
      assertKeyConceptsLast(`Intro.\n\n${deck}\n\n  \n`)
    ).not.toThrow();
  });

  it("rejects a deck followed by more content", () => {
    expect(() => assertKeyConceptsLast(`${deck}\n\n## Next section`)).toThrow(
      /must be the last block.*## Next section/
    );
  });

  it("rejects a deck followed by a divider", () => {
    expect(() => assertKeyConceptsLast(`${deck}\n\n---\n`)).toThrow(
      /last block/
    );
  });

  it("rejects more than one deck", () => {
    expect(() => assertKeyConceptsLast(`${deck}\n\n${deck}`)).toThrow(
      /only one/
    );
  });

  it("rejects an unclosed deck", () => {
    expect(() =>
      assertKeyConceptsLast(
        '<div class="key-concepts">\n\n<div class="concept">\n\n</div>\n'
      )
    ).toThrow(/never closed/);
  });

  it("names the post in the error", () => {
    expect(() => assertKeyConceptsLast(`${deck}\n\nMore.`, "My Post")).toThrow(
      /"My Post"/
    );
  });

  it("ignores the syntax when it only appears inside code", () => {
    const fenced = "```html\n" + deck + "\n```\n\nMore text after.";
    const inline = 'Use `<div class="key-concepts">` for decks.\n\nMore text.';
    expect(() => assertKeyConceptsLast(fenced)).not.toThrow();
    expect(() => assertKeyConceptsLast(inline)).not.toThrow();
  });
});

describe("splitKeyConcepts", () => {
  it("separates the article text from the deck", () => {
    const { body, deck: found } = splitKeyConcepts(
      `Intro.\n\n## Heading\n\nText.\n\n${deck}\n`
    );
    expect(body).toBe("Intro.\n\n## Heading\n\nText.");
    expect(found).toBe(deck);
  });

  it("returns the whole post and no deck when there isn't one", () => {
    const { body, deck: found } = splitKeyConcepts(
      "Just text.\n\n## A heading"
    );
    expect(body).toBe("Just text.\n\n## A heading");
    expect(found).toBe(null);
  });

  it("ignores the syntax when it only appears inside code", () => {
    const content = 'Use `<div class="key-concepts">` for decks.';
    expect(splitKeyConcepts(content).deck).toBe(null);
  });

  it("still rejects a deck that isn't last", () => {
    expect(() => splitKeyConcepts(`${deck}\n\n## After`)).toThrow(/last block/);
  });

  it("lets the deck be indented, which markdown would otherwise read as code", () => {
    const indented = [
      '<div class="key-concepts" data-title="Key concepts">',
      "",
      '  <div class="concept">',
      "",
      "    #### One",
      "    Body.",
      "",
      "  </div>",
      "",
      '  <div class="concept">',
      "",
      "    #### Two",
      "    Body.",
      "",
      "  </div>",
      "",
      "</div>",
    ].join("\n");
    expect(splitKeyConcepts(`Intro.\n\n${indented}`).deck).toBe(deck);
  });

  it("keeps indentation within a card that's deeper than the rest", () => {
    const indented = [
      '<div class="key-concepts">',
      '    <div class="concept">',
      "        #### One",
      "        - first",
      "          - nested",
      "    </div>",
      "</div>",
    ].join("\n");
    expect(splitKeyConcepts(indented).deck).toBe(
      [
        '<div class="key-concepts">',
        "",
        '<div class="concept">',
        "",
        "#### One",
        "- first",
        "  - nested",
        "",
        "</div>",
        "",
        "</div>",
      ].join("\n")
    );
  });

  it("handles tabs", () => {
    const indented =
      '<div class="key-concepts">\n\t<div class="concept">\n\t\t#### One\n\t\tBody.\n\t</div>\n</div>';
    expect(splitKeyConcepts(indented).deck).toBe(
      '<div class="key-concepts">\n\n<div class="concept">\n\n#### One\nBody.\n\n</div>\n\n</div>'
    );
  });

  it("adds the blank lines markdown needs around the divs", () => {
    // Without them the whole deck is one raw HTML block, and none of the
    // markdown inside it (headings, bold, maths) gets parsed.
    const written = [
      '<div class="key-concepts">',
      '\t<div class="concept">',
      "\t\t#### One",
      "\t\tBody with **bold**.",
      "\t</div>",
      '\t<div class="concept">',
      "\t\t#### Two",
      "\t\tBody.",
      "\t</div>",
      "</div>",
    ].join("\n");
    expect(splitKeyConcepts(`Intro.\n\n${written}`).deck).toBe(
      [
        '<div class="key-concepts">',
        "",
        '<div class="concept">',
        "",
        "#### One",
        "Body with **bold**.",
        "",
        "</div>",
        "",
        '<div class="concept">',
        "",
        "#### Two",
        "Body.",
        "",
        "</div>",
        "",
        "</div>",
      ].join("\n")
    );
  });

  it("sets display equations apart from the text around them", () => {
    const written = [
      '<div class="key-concepts">',
      '\t<div class="concept">',
      "\t\t#### One",
      "\t\tBefore:",
      "\t\t$$",
      "\t\ta + b = c",
      "\t\t$$",
      "\t\tAfter.",
      "\t</div>",
      "</div>",
    ].join("\n");
    expect(splitKeyConcepts(written).deck).toBe(
      [
        '<div class="key-concepts">',
        "",
        '<div class="concept">',
        "",
        "#### One",
        "Before:",
        "",
        "$$",
        "a + b = c",
        "$$",
        "",
        "After.",
        "",
        "</div>",
        "",
        "</div>",
      ].join("\n")
    );
  });

  it("leaves an unindented deck exactly as written", () => {
    expect(splitKeyConcepts(`Intro.\n\n${deck}`).deck).toBe(deck);
  });
});
