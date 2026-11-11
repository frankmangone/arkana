import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Post } from "@/lib/types";
import { PostContent } from "./index";

vi.mock("@/lib/posts/translations", () => ({
  getHiddenPostKeys: async () => new Set<string>(),
}));

const deck = `<div class="key-concepts">

<div class="concept">

#### Alpha
Body.

</div>

</div>`;

const render = async (content: string, tldrLabel?: string) =>
  renderToStaticMarkup(
    await PostContent({
      post: {
        content,
        metadata: { title: "T", visible: true },
      } as unknown as Post,
      tldrLabel,
    })
  );

describe("PostContent and the key-concepts deck", () => {
  it("renders the article text but leaves the deck to the hero modal", async () => {
    const html = await render(`Intro text.\n\n${deck}`);
    expect(html).toContain("Intro text.");
    expect(html).not.toContain("Alpha");
    expect(html).not.toContain("carousel");
  });

  it("puts the button in the first separator when the post has a deck", async () => {
    const html = await render(`Intro text.\n\n${deck}`, "Too long");
    expect(html.match(/Too long/g)).toHaveLength(1);
  });

  it("has no button without a deck", async () => {
    const html = await render("Intro text.", "Too long");
    expect(html).not.toContain("Too long");
  });

  it("fails the build when the deck isn't the last block", async () => {
    await expect(render(`${deck}\n\nTrailing text.`)).rejects.toThrow(
      /last block/
    );
  });
});
