import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "./llms-txt";
import type { PublicPost } from "./index";

const post = (
  lang: "en" | "es" | "pt",
  folder: string,
  slug: string,
  date: string,
  title: string,
  description?: string
): PublicPost => ({
  lang,
  folder,
  slug,
  metadata: { title, date, author: "x", tags: [], description },
  authorName: "X",
  url: `https://arkana.blog/${lang}/blog/${folder}/${slug}/`,
  markdownUrl: `https://arkana.blog/${lang}/blog/${folder}/${slug}/index.md`,
});

const posts = [
  post(
    "en",
    "understanding-ai",
    "second",
    "2026-02-01",
    "Second",
    "The   second\nstep."
  ),
  post(
    "en",
    "understanding-ai",
    "first",
    "2026-01-01",
    "First",
    "The first step."
  ),
  post(
    "es",
    "understanding-ai",
    "first",
    "2026-01-01",
    "Primero",
    "El primer paso."
  ),
  post("pt", "understanding-ai", "first", "2026-01-01", "Primeiro"),
  post("en", "the-zk-chronicles", "old", "2024-01-01", "Old [one]"),
  post(
    "es",
    "blockchain-101",
    "solo",
    "2025-01-01",
    "Solo en español",
    "Sin inglés."
  ),
];

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt(posts);

  it("starts with the title and a summary quote", () => {
    expect(text).toMatch(/^# Arkana\n\n> /);
  });

  it("groups articles under their series name, in reading order", () => {
    const first = text.indexOf("[First]");
    const second = text.indexOf("[Second]");
    expect(text).toContain("## Understanding AI\n");
    expect(text).toContain("## The ZK Chronicles\n");
    expect(first > 0 && first < second).toBe(true);
  });

  it("lists the series with the newest article first", () => {
    expect(
      text.indexOf("## Understanding AI") < text.indexOf("## Blockchain 101")
    ).toBe(true);
    expect(
      text.indexOf("## Blockchain 101") < text.indexOf("## The ZK Chronicles")
    ).toBe(true);
  });

  it("links the markdown version with a one-line description", () => {
    expect(text).toContain(
      "- [Second](https://arkana.blog/en/blog/understanding-ai/second/index.md): The second step."
    );
  });

  it("puts translations beside the English entry", () => {
    expect(text).toContain(
      "[First](https://arkana.blog/en/blog/understanding-ai/first/index.md): The first step. ([es](https://arkana.blog/es/blog/understanding-ai/first/index.md), [pt](https://arkana.blog/pt/blog/understanding-ai/first/index.md))"
    );
    expect(text).not.toContain("Primero");
  });

  it("lists an article that only exists in another language", () => {
    expect(text).toContain(
      "- [Solo en español](https://arkana.blog/es/blog/blockchain-101/solo/index.md): Sin inglés."
    );
  });

  it("escapes brackets in titles", () => {
    expect(text).toContain("[Old \\[one\\]]");
  });
});
