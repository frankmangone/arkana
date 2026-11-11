import { describe, expect, it } from "vitest";
import { toAgentMarkdown, type AgentMarkdownInput } from "./to-markdown";

const base: AgentMarkdownInput = {
  content: "Hello.",
  metadata: {
    title: "A post",
    date: "2026-01-02",
    author: "frank-mangone",
    tags: ["math"],
    description: "About things.",
  },
  lang: "en",
  folder: "series",
  slug: "a-post",
  authorName: "Frank Mangone",
  hiddenPostKeys: new Set(["en/series/draft"]),
  keyConceptsHeading: "Key concepts",
};

const convert = (
  content: string,
  overrides: Partial<AgentMarkdownInput> = {}
) => toAgentMarkdown({ ...base, ...overrides, content });

describe("toAgentMarkdown", () => {
  it("starts with frontmatter and a title heading", () => {
    const markdown = convert("Hello.");
    expect(markdown).toMatch(/^---\ntitle: A post\n/);
    expect(markdown).toContain("author: Frank Mangone");
    expect(markdown).toContain(
      "url: 'https://arkana.blog/en/blog/series/a-post/'"
    );
    expect(markdown).toContain("series: series");
    expect(markdown).toContain("\n---\n\n# A post\n\nHello.\n");
  });

  it("leaves out the content hash and links format", () => {
    const markdown = convert("x", {
      metadata: { ...base.metadata, contentHash: "abc" },
    });
    expect(markdown).not.toContain("contentHash");
    expect(markdown).not.toContain("linksFormat");
  });

  it("makes site-relative links and images absolute", () => {
    const markdown = convert(
      '[a](/en/blog/s/x#h) ![i](/images/p.png) [e](https://e.com) <img src="/images/q.png">'
    );
    expect(markdown).toContain("[a](https://arkana.blog/en/blog/s/x#h)");
    expect(markdown).toContain("![i](https://arkana.blog/images/p.png)");
    expect(markdown).toContain("[e](https://e.com)");
    expect(markdown).toContain('src="https://arkana.blog/images/q.png"');
  });

  it("converts wikilinks", () => {
    const markdown = convert(
      "[[content/en/s/other|the other]] and [[content/en/s/other#Some Heading|here]]"
    );
    expect(markdown).toContain(
      "[the other](https://arkana.blog/en/blog/s/other)"
    );
    expect(markdown).toContain(
      "[here](https://arkana.blog/en/blog/s/other#some-heading)"
    );
  });

  it("drops links to hidden posts but keeps their text", () => {
    const markdown = convert(
      "See [the draft](/en/blog/series/draft) and [real](/en/blog/series/real)."
    );
    expect(markdown).toContain("See the draft and");
    expect(markdown).not.toContain("series/draft");
    expect(markdown).toContain(
      "[real](https://arkana.blog/en/blog/series/real)"
    );
  });

  it("keeps links to hidden posts when the post itself is hidden", () => {
    const markdown = convert("[d](/en/blog/series/draft)", {
      hiddenPostKeys: new Set(),
    });
    expect(markdown).toContain("series/draft");
  });

  it("turns the custom blocks into plain markdown", () => {
    const markdown = convert(
      [
        ":::big-quote\nFirst line\n\nSecond line\n:::",
        '<quiz src="/s/x.json" lang="en" />',
        '<video-embed src="https://youtu.be/abc" />',
        '<embed-frame src="/embeds/foo/" height="420" title="Foo" />',
      ].join("\n\n")
    );
    expect(markdown).toContain("> First line\n>\n> Second line");
    expect(markdown).toContain(
      "[web version](https://arkana.blog/en/blog/series/a-post/)"
    );
    expect(markdown).toContain("[Video](https://youtu.be/abc)");
    expect(markdown).toContain(
      "[Interactive demo: Foo](https://arkana.blog/embeds/foo/)"
    );
    expect(markdown).not.toContain("<quiz");
    expect(markdown).not.toContain("<video-embed");
    expect(markdown).not.toContain("<embed-frame");
  });

  it("leaves code untouched, apart from the playground marker", () => {
    const code = '```python run\nprint("[a](/x)")  # <quiz src="y" />\n```';
    const markdown = convert(`${code}\n\nand \`[b](/y)\` inline`);
    expect(markdown).toContain(
      '```python\nprint("[a](/x)")  # <quiz src="y" />\n```'
    );
    expect(markdown).toContain("`[b](/y)`");
  });

  it("keeps math as it is", () => {
    const markdown = convert("Inline $a_1 + b$ and\n\n$$\n\\frac{a}{b}\n$$");
    expect(markdown).toContain("$a_1 + b$");
    expect(markdown).toContain("$$\n\\frac{a}{b}\n$$");
  });

  it("appends the key concepts deck as a section", () => {
    const markdown = convert(
      'Body.\n\n<div class="key-concepts">\n<div class="concept">\n\n#### Idea\n\nDetail.\n\n</div>\n</div>'
    );
    expect(markdown).toContain(
      "Body.\n\n## Key concepts\n\n### Idea\n\nDetail."
    );
    expect(markdown).not.toContain("<div");
  });

  it("fails, like the page, when the deck isn't last", () => {
    expect(() =>
      convert(
        '<div class="key-concepts">\n<div class="concept">\n\n#### A\n\nb\n\n</div>\n</div>\n\nAfter.'
      )
    ).toThrow(/last block/);
  });
});
