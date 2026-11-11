import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Post } from "@/lib/types";
import { keyConceptsRecapLabel } from "../post-content/key-concepts-recap";
import { FinishedRecap } from "./finished-recap";

const deck = `<div class="key-concepts">

<div class="concept">

#### Alpha
Body.

</div>

</div>`;

const post = (content: string) =>
  ({ content, metadata: { title: "T" } }) as unknown as Post;

describe("keyConceptsRecapLabel", () => {
  it("returns the label when the post has a deck", () => {
    expect(
      keyConceptsRecapLabel(post(`Intro.\n\n${deck}`), "A quick refresher?")
    ).toBe("A quick refresher?");
  });

  it("returns nothing without a deck", () => {
    expect(
      keyConceptsRecapLabel(post("Just text."), "A quick refresher?")
    ).toBeUndefined();
  });
});

describe("FinishedRecap", () => {
  it("shows the mark and the button once completed", () => {
    const html = renderToStaticMarkup(
      <FinishedRecap
        label="Article finished!"
        recapLabel="A quick refresher?"
        completed
      />
    );
    expect(html).toContain("Article finished!");
    expect(html).toContain("<button");
    expect(html).toContain("A quick refresher?");
  });

  it("holds the mark's place, without the mark, until then", () => {
    const html = renderToStaticMarkup(
      <FinishedRecap
        label="Article finished!"
        recapLabel="A quick refresher?"
        completed={false}
      />
    );
    expect(html).not.toContain("Article finished!");
    expect(html).toContain("<button");
    expect(html).toContain("A quick refresher?");
  });
});
