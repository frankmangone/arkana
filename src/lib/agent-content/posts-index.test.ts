import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/site-config";
import type { PublicPost } from "./index";
import { buildPostsIndex, buildRootIndex } from "./posts-index";

const post = (
  lang: "en" | "es" | "pt",
  folder: string,
  slug: string,
  date: string,
  title: string
): PublicPost => ({
  lang,
  folder,
  slug,
  metadata: {
    title,
    date,
    author: "frank-mangone",
    tags: ["math"],
    description: `About ${title}.`,
    readingTime: "9 min",
  },
  authorName: "Frank Mangone",
  url: `${SITE_URL}/${lang}/blog/${folder}/${slug}/`,
  markdownUrl: `${SITE_URL}/${lang}/blog/${folder}/${slug}/index.md`,
});

// Newest first, as getPublicPosts returns them.
const posts = [
  post("en", "understanding-ai", "second", "2026-02-01", "Second"),
  post("en", "understanding-ai", "first", "2026-01-01", "First"),
  post("es", "understanding-ai", "first", "2026-01-01", "Primero"),
  post("en", "the-zk-chronicles", "old", "2024-01-01", "Old"),
];

describe("buildPostsIndex", () => {
  const index = buildPostsIndex("en", posts);

  it("lists only the language's articles, in the order given", () => {
    expect(index.lang).toBe("en");
    expect(index.count).toBe(3);
    expect(index.posts.map((p) => p.slug).join(",")).toBe(
      "understanding-ai/second,understanding-ai/first,the-zk-chronicles/old"
    );
  });

  it("describes each article", () => {
    const [second] = index.posts;
    expect(second.title).toBe("Second");
    expect(second.description).toBe("About Second.");
    expect(second.seriesName).toBe("Understanding AI");
    expect(second.author).toBe("Frank Mangone");
    expect(second.readingTime).toBe("9 min");
    expect(second.markdownUrl).toBe(
      `${SITE_URL}/en/blog/understanding-ai/second/index.md`
    );
  });

  it("counts the articles in each series", () => {
    expect(index.series.length).toBe(2);
    expect(index.series[0].name).toBe("Understanding AI");
    expect(index.series[0].articles).toBe(2);
  });

  it("links the translations of an article", () => {
    const first = index.posts.find((p) => p.slug.endsWith("/first"));
    expect(first?.translations.es?.markdownUrl).toBe(
      `${SITE_URL}/es/blog/understanding-ai/first/index.md`
    );
    expect(Object.keys(index.posts[0].translations).length).toBe(0);
  });

  it("is plain JSON", () => {
    expect(JSON.stringify(index)).toBe(
      JSON.stringify(JSON.parse(JSON.stringify(index)))
    );
  });
});

describe("buildRootIndex", () => {
  it("lists each language's index with its article count", () => {
    const root = buildRootIndex(posts);
    const en = root.languages.find((l) => l.lang === "en");
    const es = root.languages.find((l) => l.lang === "es");
    expect(en?.count).toBe(3);
    expect(es?.count).toBe(1);
    expect(en?.postsUrl).toBe(`${SITE_URL}/en/posts.json`);
    expect(root.llmsTxt).toBe(`${SITE_URL}/llms.txt`);
  });
});
