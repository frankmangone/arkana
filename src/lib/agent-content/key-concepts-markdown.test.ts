import { describe, expect, it } from "vitest";
import { deckToMarkdown } from "./key-concepts-markdown";

const deck = `<div class="key-concepts" data-title="Key concepts">
<div class="concept">

#### First idea

Some **text** and $x^2$.

</div>
<div class="concept">

#### Second idea

$$
a + b
$$

</div>
</div>`;

describe("deckToMarkdown", () => {
  it("makes one ### section per card under the heading", () => {
    const markdown = deckToMarkdown(deck, "Key concepts");
    expect(markdown).toContain(
      "## Key concepts\n\n### First idea\n\nSome **text**"
    );
    expect(markdown).toContain("### Second idea\n\n$$\na + b\n$$");
  });

  it("leaves no HTML behind", () => {
    expect(deckToMarkdown(deck, "Key concepts")).not.toContain("<div");
  });

  it("keeps a nested div inside its card", () => {
    const nested = deck.replace("Some **text**", "<div>inner</div> Some");
    expect(deckToMarkdown(nested, "Key concepts")).toContain(
      "<div>inner</div> Some"
    );
  });

  it("returns an empty string when there are no cards", () => {
    expect(deckToMarkdown('<div class="key-concepts"></div>', "K")).toBe("");
  });
});
