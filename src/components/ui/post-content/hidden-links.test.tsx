import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Post } from "@/lib/types";
import { PostContent } from "./index";

vi.mock("@/lib/posts/translations", () => ({
  getHiddenPostKeys: async () => new Set(["en/series/secret"]),
}));

const content =
  "See [the draft](/en/blog/series/secret#intro) and [a public post](/en/blog/series/public).";

async function render(visible: boolean): Promise<string> {
  const post = {
    content,
    metadata: { visible },
  } as unknown as Post;
  return renderToStaticMarkup(await PostContent({ post }));
}

describe("PostContent links to hidden posts", () => {
  it("renders a link to a hidden post as plain text from a visible post", async () => {
    const html = await render(true);
    expect(html).not.toContain("/en/blog/series/secret");
    expect(html).toContain("the draft");
    expect(html).toContain('href="/en/blog/series/public"');
  });

  it("keeps the link working when the linking post is itself hidden", async () => {
    const html = await render(false);
    expect(html).toContain('href="/en/blog/series/secret#intro"');
  });
});
