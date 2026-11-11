#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
// Checks the agent-facing files of a finished static export (`next build`)
// against the content they were generated from:
//   - every visible article has a clean index.md, an entry in its language's
//     posts.json and in llms.txt, and an HTML page that advertises the markdown
//   - no hidden (visible: false) article has an index.md or shows up in
//     posts.json, llms.txt, the sitemap or the RSS feed
//   - posts.json, api/index.json, llms.txt and robots.txt exist and agree
// Run it after a build: `pnpm agent:check` (reads out/ and src/data/content).
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

// Things the markdown conversion should have replaced or removed.
const LEFTOVERS = [
  [/<quiz\b/, "<quiz> tag"],
  [/<video-embed\b/, "<video-embed> tag"],
  [/<embed-frame\b/, "<embed-frame> tag"],
  [/:::\s*big-quote/, ":::big-quote block"],
  [/<big-quote>/, "<big-quote> tag"],
  [/(?<!!)\[\[[^\]]+\]\]/, "wikilink"],
  [/class="(key-concepts|concept)"/, "key-concepts markup"],
  [/\]\(\/(?!\/)/, "relative link or image"],
];

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/** Every article in the content tree, split into visible and hidden. */
function readSource(contentDir, problems) {
  const visible = [];
  const hidden = [];
  for (const lang of listDirs(contentDir)) {
    for (const folder of listDirs(path.join(contentDir, lang))) {
      const folderPath = path.join(contentDir, lang, folder);
      for (const file of fs.readdirSync(folderPath)) {
        if (!file.endsWith(".md")) continue;
        const slug = file.replace(/\.md$/, "");
        let data;
        try {
          ({ data } = matter(
            fs.readFileSync(path.join(folderPath, file), "utf8")
          ));
        } catch (error) {
          problems.push(
            `${lang}/${folder}/${slug}: unreadable frontmatter (${error.message})`
          );
          continue;
        }
        (data.visible === false ? hidden : visible).push({
          lang,
          folder,
          slug,
        });
      }
    }
  }
  return { visible, hidden };
}

function readText(file, problems, label) {
  if (!fs.existsSync(file)) {
    problems.push(`${label}: file is missing`);
    return null;
  }
  return fs.readFileSync(file, "utf8");
}

function readJson(file, problems, label) {
  const text = readText(file, problems, label);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    problems.push(`${label}: not valid JSON`);
    return null;
  }
}

function checkAgentOutputs({ outDir, contentDir }) {
  const problems = [];
  const { visible, hidden } = readSource(contentDir, problems);
  const langs = [...new Set([...visible, ...hidden].map((post) => post.lang))];
  const where = (post) => `${post.lang}/${post.folder}/${post.slug}`;
  const articleDir = (post) =>
    path.join(outDir, post.lang, "blog", post.folder, post.slug);

  // Top-level files
  const llms = readText(path.join(outDir, "llms.txt"), problems, "llms.txt");
  const sitemap = readText(
    path.join(outDir, "sitemap.xml"),
    problems,
    "sitemap.xml"
  );
  const robots = readText(
    path.join(outDir, "robots.txt"),
    problems,
    "robots.txt"
  );
  if (robots !== null && !/^Sitemap:/m.test(robots)) {
    problems.push("robots.txt: no Sitemap line");
  }
  const rootIndex = readJson(
    path.join(outDir, "api", "index.json"),
    problems,
    "api/index.json"
  );

  // Per-language indexes
  const indexes = {};
  const rss = {};
  for (const lang of langs) {
    indexes[lang] = readJson(
      path.join(outDir, lang, "posts.json"),
      problems,
      `${lang}/posts.json`
    );
    rss[lang] = readText(
      path.join(outDir, lang, "rss.xml"),
      problems,
      `${lang}/rss.xml`
    );
    const expected = visible.filter((post) => post.lang === lang).length;
    const index = indexes[lang];
    if (index) {
      if (index.count !== expected || index.posts.length !== expected) {
        problems.push(
          `${lang}/posts.json: lists ${index.posts.length} articles (count ${index.count}), expected ${expected}`
        );
      }
    }
    const entry = rootIndex?.languages?.find((item) => item.lang === lang);
    if (rootIndex && (!entry || entry.count !== expected)) {
      problems.push(
        `api/index.json: ${lang} count is ${entry?.count}, expected ${expected}`
      );
    }
  }

  // Visible articles
  const visibleKeys = new Set(visible.map(where));
  for (const post of visible) {
    const label = where(post);
    const markdownPath = path.join(articleDir(post), "index.md");
    const markdown = readText(markdownPath, problems, `${label}/index.md`);
    if (markdown !== null) {
      if (!markdown.startsWith("---\n") || !/\n# \S/.test(markdown)) {
        problems.push(
          `${label}/index.md: missing frontmatter or title heading`
        );
      }
      for (const [pattern, name] of LEFTOVERS) {
        if (pattern.test(markdown))
          problems.push(`${label}/index.md: contains a ${name}`);
      }
    }

    const entry = indexes[post.lang]?.posts?.find(
      (item) => item.slug === `${post.folder}/${post.slug}`
    );
    if (indexes[post.lang] && !entry) {
      problems.push(
        `${post.lang}/posts.json: missing ${post.folder}/${post.slug}`
      );
    } else if (
      entry &&
      !entry.markdownUrl.endsWith(
        `/${post.lang}/blog/${post.folder}/${post.slug}/index.md`
      )
    ) {
      problems.push(
        `${post.lang}/posts.json: wrong markdownUrl for ${post.folder}/${post.slug}`
      );
    }

    if (
      llms !== null &&
      !llms.includes(`/${post.lang}/blog/${post.folder}/${post.slug}/index.md`)
    ) {
      problems.push(`llms.txt: missing ${label}`);
    }

    const html = readText(
      path.join(articleDir(post), "index.html"),
      problems,
      `${label}/index.html`
    );
    if (html !== null) {
      if (!html.includes('type="text/markdown"')) {
        problems.push(
          `${label}/index.html: no markdown <link rel="alternate">`
        );
      }
      if (!html.includes('"encodingFormat":"text/markdown"')) {
        problems.push(`${label}/index.html: JSON-LD has no markdown encoding`);
      }
    }
  }

  // Markdown files with no visible article behind them
  for (const lang of langs) {
    for (const folder of listDirs(path.join(outDir, lang, "blog"))) {
      for (const slug of listDirs(path.join(outDir, lang, "blog", folder))) {
        const key = `${lang}/${folder}/${slug}`;
        if (
          fs.existsSync(
            path.join(outDir, lang, "blog", folder, slug, "index.md")
          ) &&
          !visibleKeys.has(key)
        ) {
          problems.push(
            `${key}/index.md: exists but the article isn't visible`
          );
        }
      }
    }
  }

  // Hidden articles must not be mentioned anywhere
  for (const post of hidden) {
    const label = where(post);
    const mention = new RegExp(
      `/${post.lang}/blog/${escapeRegExp(post.folder)}/${escapeRegExp(post.slug)}(?![\\w-])`
    );
    const places = [
      ["llms.txt", llms],
      ["sitemap.xml", sitemap],
      [
        `${post.lang}/posts.json`,
        indexes[post.lang] ? JSON.stringify(indexes[post.lang]) : null,
      ],
      [`${post.lang}/rss.xml`, rss[post.lang]],
    ];
    for (const [name, text] of places) {
      if (text && mention.test(text))
        problems.push(`${name}: mentions hidden article ${label}`);
    }
  }

  return { problems, visible: visible.length, hidden: hidden.length };
}

function main() {
  const root = path.join(__dirname, "..");
  const outDir = path.join(root, "out");
  const contentDir = path.join(root, "src", "data", "content");

  if (!fs.existsSync(outDir)) {
    console.error("No out/ directory: run `next build` first.");
    process.exit(1);
  }
  const { problems, visible, hidden } = checkAgentOutputs({
    outDir,
    contentDir,
  });

  if (visible === 0) {
    console.error(
      "No articles found under src/data/content - refusing to report success."
    );
    process.exit(1);
  }
  if (problems.length === 0) {
    console.log(
      `Agent outputs OK: ${visible} visible articles checked, ${hidden} hidden ones kept out.`
    );
    return;
  }
  console.error(`${problems.length} problem(s) in the agent outputs:`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

if (require.main === module) main();

module.exports = { checkAgentOutputs };
