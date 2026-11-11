import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Post } from "@/lib/types";
import { KeyConceptsRecap } from "./key-concepts-recap";

const deck = `<div class="key-concepts">

<div class="concept">

#### Alpha
Body.

</div>

</div>`;

const dictionary = {
  title: "Key concepts",
  recapTitle: "Want a quick refresher?",
  recapText: "The key ideas of this article.",
};

const post = (content: string) =>
  ({ content, metadata: { title: "T" } }) as unknown as Post;

describe("KeyConceptsRecap", () => {
  it("renders a card with the heading, the text and the button when the post has a deck", () => {
    const html = renderToStaticMarkup(
      <KeyConceptsRecap
        post={post(`Intro.\n\n${deck}`)}
        dictionary={dictionary}
      />
    );
    expect(html).toContain("Want a quick refresher?");
    expect(html).toContain("The key ideas of this article.");
    expect(html).toContain("<button");
    expect(html).toContain("Key concepts");
  });

  it("renders nothing without a deck", () => {
    const html = renderToStaticMarkup(
      <KeyConceptsRecap post={post("Just text.")} dictionary={dictionary} />
    );
    expect(html).toBe("");
  });
});
