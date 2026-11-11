import { describe, expect, it } from "vitest";
import { buildBlogPostingJsonLd } from "./json-ld";
import { SITE_URL } from "./site-config";
import type { Post } from "./types";

const post = (content: string, readingTime = "16 min"): Post => ({
  content,
  metadata: {
    title: "A post",
    date: "2026-01-02",
    author: "frank-mangone",
    tags: ["math", "ai"],
    description: "About things.",
    readingTime,
  },
});

const writer = { name: "Frank Mangone", slug: "frank-mangone" };
const build = (p: Post) =>
  buildBlogPostingJsonLd({
    post: p,
    lang: "en",
    slug: "understanding-ai/a-post",
    writer,
  });

describe("buildBlogPostingJsonLd", () => {
  it("keeps the basic article fields", () => {
    const jsonLd = build(post("Body."));
    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.headline).toBe("A post");
    expect(jsonLd.datePublished).toBe("2026-01-02");
    expect(jsonLd.keywords).toBe("math, ai");
    expect(jsonLd.inLanguage).toBe("en");
    expect(jsonLd.url).toBe(`${SITE_URL}/en/blog/understanding-ai/a-post`);
    expect(jsonLd.author.url).toBe(`${SITE_URL}/en/writers/frank-mangone`);
  });

  it("names the series the article belongs to", () => {
    expect(build(post("Body.")).isPartOf?.name).toBe("Understanding AI");
  });

  it("points at the markdown version", () => {
    const encoding = build(post("Body.")).encoding;
    expect(encoding?.contentUrl).toBe(
      `${SITE_URL}/en/blog/understanding-ai/a-post/index.md`
    );
    expect(encoding?.encodingFormat).toBe("text/markdown");
  });

  it("converts the reading time to a duration", () => {
    expect(build(post("Body.")).timeRequired).toBe("PT16M");
    expect(build(post("Body.", "")).timeRequired).toBe(undefined);
  });

  it("uses the key concepts deck as the abstract", () => {
    const deck =
      '<div class="key-concepts">\n<div class="concept">\n\n#### Vectors\n\nA **vector** is a list.\n\n$$\nx = 1\n$$\n\n</div>\n</div>';
    const jsonLd = build(post(`Body.\n\n${deck}`));
    expect(jsonLd.abstract).toBe("Vectors. A vector is a list.");
  });

  it("has no abstract without a deck", () => {
    expect("abstract" in build(post("Body."))).toBe(false);
  });
});
