// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { checkAgentOutputs } = require("./check-agent-outputs.js");

const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

const MARKDOWN = "---\ntitle: A\n---\n\n# A\n\nBody text.\n";
const HTML =
  '<link rel="alternate" type="text/markdown" href="x"/><script>{"encodingFormat":"text/markdown"}</script>';

// A small content tree and a matching, correct export of it:
//   en: shown-one, shown-two (visible), secret (hidden); es: shown-one
function makeFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-outputs-"));
  const contentDir = path.join(dir, "content");
  const outDir = path.join(dir, "out");
  const posts = [
    ["en", "shown-one", true],
    ["en", "shown-two", true],
    ["en", "secret", false],
    ["es", "shown-one", true],
  ];
  const url = (lang, slug, file = "") =>
    `https://arkana.blog/${lang}/blog/series/${slug}/${file}`;

  for (const [lang, slug, visible] of posts) {
    write(
      path.join(contentDir, lang, "series", `${slug}.md`),
      `---\ntitle: A\nvisible: ${visible}\n---\nBody\n`
    );
    if (!visible) continue;
    const articleDir = path.join(outDir, lang, "blog", "series", slug);
    write(path.join(articleDir, "index.md"), MARKDOWN);
    write(path.join(articleDir, "index.html"), HTML);
  }

  const entry = (lang, slug) => ({
    slug: `series/${slug}`,
    markdownUrl: url(lang, slug, "index.md"),
  });
  const index = (lang, slugs) => ({
    lang,
    count: slugs.length,
    posts: slugs.map((slug) => entry(lang, slug)),
  });
  write(
    path.join(outDir, "en", "posts.json"),
    JSON.stringify(index("en", ["shown-one", "shown-two"]))
  );
  write(
    path.join(outDir, "es", "posts.json"),
    JSON.stringify(index("es", ["shown-one"]))
  );
  write(
    path.join(outDir, "api", "index.json"),
    JSON.stringify({
      languages: [
        { lang: "en", count: 2 },
        { lang: "es", count: 1 },
      ],
    })
  );
  write(
    path.join(outDir, "llms.txt"),
    [
      url("en", "shown-one", "index.md"),
      url("en", "shown-two", "index.md"),
      url("es", "shown-one", "index.md"),
    ].join("\n")
  );
  write(path.join(outDir, "sitemap.xml"), url("en", "shown-one"));
  write(
    path.join(outDir, "robots.txt"),
    "User-Agent: *\nAllow: /\n\nSitemap: https://arkana.blog/sitemap.xml\n"
  );
  write(path.join(outDir, "en", "rss.xml"), "<rss/>");
  write(path.join(outDir, "es", "rss.xml"), "<rss/>");
  return { dir, contentDir, outDir };
}

// Builds a fixture, lets the test break something, and returns the problems.
function problemsAfter(change) {
  const fixture = makeFixture();
  try {
    change?.(fixture);
    return checkAgentOutputs(fixture).problems;
  } finally {
    fs.rmSync(fixture.dir, { recursive: true, force: true });
  }
}

describe("checkAgentOutputs", () => {
  it("passes a consistent export", () => {
    expect(problemsAfter().join("\n")).toBe("");
  });

  it("counts visible and hidden articles", () => {
    const fixture = makeFixture();
    const result = checkAgentOutputs(fixture);
    fs.rmSync(fixture.dir, { recursive: true, force: true });
    expect(result.visible).toBe(3);
    expect(result.hidden).toBe(1);
  });

  it("flags a visible article with no markdown file", () => {
    const problems = problemsAfter(({ outDir }) =>
      fs.rmSync(path.join(outDir, "en/blog/series/shown-two/index.md"))
    );
    expect(problems.join("\n")).toContain(
      "en/series/shown-two/index.md: file is missing"
    );
  });

  it("flags constructs the conversion should have replaced", () => {
    const problems = problemsAfter(({ outDir }) =>
      write(
        path.join(outDir, "en/blog/series/shown-one/index.md"),
        `${MARKDOWN}\n<quiz src="/x.json" />\n[a](/en/blog/s/x)\n`
      )
    );
    const text = problems.join("\n");
    expect(text).toContain("contains a <quiz> tag");
    expect(text).toContain("contains a relative link or image");
  });

  it("flags an article missing from posts.json or llms.txt", () => {
    const problems = problemsAfter(({ outDir }) => {
      write(
        path.join(outDir, "es/posts.json"),
        JSON.stringify({ lang: "es", count: 0, posts: [] })
      );
      write(path.join(outDir, "llms.txt"), "nothing here");
    });
    const text = problems.join("\n");
    expect(text).toContain("es/posts.json: lists 0 articles");
    expect(text).toContain("es/posts.json: missing series/shown-one");
    expect(text).toContain("llms.txt: missing en/series/shown-two");
  });

  it("flags a page that doesn't advertise the markdown version", () => {
    const problems = problemsAfter(({ outDir }) =>
      write(
        path.join(outDir, "en/blog/series/shown-one/index.html"),
        "<html></html>"
      )
    );
    const text = problems.join("\n");
    expect(text).toContain('no markdown <link rel="alternate">');
    expect(text).toContain("JSON-LD has no markdown encoding");
  });

  it("flags a hidden article that got a markdown file", () => {
    const problems = problemsAfter(({ outDir }) =>
      write(path.join(outDir, "en/blog/series/secret/index.md"), MARKDOWN)
    );
    expect(problems.join("\n")).toContain(
      "en/series/secret/index.md: exists but the article isn't visible"
    );
  });

  it("flags a hidden article mentioned in llms.txt, the sitemap or the index", () => {
    const problems = problemsAfter(({ outDir }) => {
      const link = "https://arkana.blog/en/blog/series/secret/";
      write(
        path.join(outDir, "llms.txt"),
        fs.readFileSync(path.join(outDir, "llms.txt"), "utf8") +
          `\n${link}index.md`
      );
      write(path.join(outDir, "sitemap.xml"), link);
    });
    const text = problems.join("\n");
    expect(text).toContain(
      "llms.txt: mentions hidden article en/series/secret"
    );
    expect(text).toContain(
      "sitemap.xml: mentions hidden article en/series/secret"
    );
  });

  it("doesn't mistake a longer slug for the hidden one", () => {
    const problems = problemsAfter(({ outDir }) =>
      write(
        path.join(outDir, "sitemap.xml"),
        "https://arkana.blog/en/blog/series/secret-garden/"
      )
    );
    expect(problems.join("\n")).toBe("");
  });

  it("flags missing top-level files", () => {
    const problems = problemsAfter(({ outDir }) => {
      fs.rmSync(path.join(outDir, "robots.txt"));
      fs.rmSync(path.join(outDir, "api/index.json"));
    });
    const text = problems.join("\n");
    expect(text).toContain("robots.txt: file is missing");
    expect(text).toContain("api/index.json: file is missing");
  });
});
