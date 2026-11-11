# Making Arkana attractive for agentic traffic

Plan agreed 2026-11-11. The site is a static export, so everything below is
generated at build time (route handlers with `generateStaticParams`, like
`rss.xml`). One shared module turns a post into clean agent-readable markdown
and one function lists the public posts; markdown files, `llms.txt`, the JSON
index and JSON-LD all read from them so they can't drift apart.

Status: **All phases done** (5 dropped, MCP skipped), each verified with a full
static export, and `pnpm agent:check` now repeats those checks.

## Phase 0: Shared foundation (`src/lib/agent-content/`)

- `getPublicPosts()`: every post with `visible !== false`, with the languages
  that actually exist. Built on `getAllPosts` / `getPostPaths`.
- `toAgentMarkdown(post, lang)`: cleaned markdown.
  - Frontmatter: keep `title`, `author`, `date`, `tags`, `description`; add
    `url`, `lang`, `series`. Drop `contentHash`, `linksFormat`.
  - Wikilinks and relative links become absolute `https://arkana.blog/...`
    URLs. Links to hidden posts become plain text (as in `hidden-links.ts`).
  - Image paths become absolute.
  - `<quiz>`, `<video-embed>`, `<embed-frame>`, `:::big-quote:::` become plain
    markdown equivalents (links / blockquote).
  - The key-concepts deck becomes a `## Key concepts` section, `###` per card.
  - Math and code are kept as they are.
- Tests: fixture-based, one per transform. (Vitest needs `pnpm install` first.)

## Phase 1: Markdown endpoints

- Route handler `blog/[folder]/[slug]/index.md/route.ts` with
  `generateStaticParams`; output `out/<lang>/blog/<folder>/<slug>/index.md`.
- Only existing translations; no file for hidden posts.
- `<link rel="alternate" type="text/markdown">` via `generateBaseMetadata`
  (`alternates.types`, new `markdownUrl` option).
- Verify: Next emits `index.md` with `trailingSlash: true`; host serves it as
  `text/markdown` or `text/plain`.

## Phase 2: `llms.txt` (done)

- `/llms.txt` only: what Arkana is, then each series with its articles as links
  to their `.md` versions plus the one-line description. An article's
  translations (es, pt) follow it on the same line. About 28 KB for the whole
  site.
- No `llms-full.txt`: the full English text is about 2 MB (~500k tokens), more
  than an agent can load, and it isn't part of the `llms.txt` proposal. Maybe
  later: per-series bundles, only if the logs show agents want them.
- Series display names live in `lib/agent-content/series.ts` (the code only had
  folder slugs); unlisted folders fall back to the title-cased slug.

## Phase 3: Article JSON-LD (done)

- `BlogPosting` and `BreadcrumbList` already existed on post pages, with a
  duplicate `BlogPosting` on reading-list post pages. Both now use one builder,
  `lib/json-ld.ts`, which adds: `abstract` (the key-concepts deck as plain text,
  since the modal is client-only), `isPartOf` (the series), `timeRequired`
  (from `readingTime`) and `encoding` (the markdown version).
- Not done: `dateModified` (waits for the `updated` field, phase 5) and a series
  level in the breadcrumb (series have no page to link to).

## Phase 4: `robots.ts` (done)

- Named groups for retrieval agents (OAI-SearchBot, ChatGPT-User,
  Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) and training
  crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot).
  All allowed today; to opt one out, move it to `disallowed`.

## Phase 5: Self-describing pages (dropped)

- Heading IDs are stable: `AnchoredHeading` slugifies the heading text (or uses
  `{#custom-id}`), and none of the 1,760 `##`/`###` headings in the content has
  a duplicate ID within its article.
- The optional `updated` frontmatter field (for `dateModified`) is not needed:
  `date` is enough. Add it later if old articles start getting substantial
  revisions.

## Phase 6: JSON index (done) and MCP (skipped)

- `/{lang}/posts.json`: `lang`, `count`, `series` (slug, name, article count)
  and `posts` (`slug`, `title`, `description`, `series`, `seriesName`, `date`,
  `author`, `tags`, `readingTime`, `url`, `markdownUrl`, `translations`).
  `/api/index.json` lists the languages with counts and points at `llms.txt`,
  the sitemap and the RSS feed. Both come from `getPublicPosts()`; pages link
  to `posts.json` with `<link rel="alternate" type="application/json">`, and
  `llms.txt` mentions both.
- MCP package: skipped for now. It would be a stdio npm package (`arkana-mcp`)
  that fetches `posts.json` and the `.md` files, exposing `list_series`,
  `search_articles` and `get_article`. It only reads public files, so it can be
  built later without changing anything here. Worth it if agent traffic shows
  up in the logs.

## Phase 7: Verification (done)

- `pnpm agent:check` (`scripts/check-agent-outputs.js`, tests in
  `scripts/check-agent-outputs.test.js`) checks a finished `next build` in
  `out/` against `src/data/content`: every visible article has a clean
  `index.md`, a `posts.json` entry, an `llms.txt` line and an HTML page that
  advertises the markdown; no hidden article has a `.md` or appears in
  `posts.json`, `llms.txt`, the sitemap or the RSS feed; `api/index.json`,
  `llms.txt` and `robots.txt` exist and agree. Exits non-zero with a list of
  problems.
- Run it after `next build` only: `out/` is also the dev server's cache
  directory, so after `next dev` it reports the files as missing.
- It runs in `.github/workflows/deploy.yml` right after the build, so a failing
  check stops the deploy before the artifact is uploaded.
- Still manual: that the host serves `.md` as `text/markdown` or `text/plain`,
  and agent traffic (agents don't run the JS analytics; use host/CDN logs, where
  `.md` and `llms.txt` hits are clean agent signal).

## Decisions taken (defaults)

1. Training bots: allow everything for now.
2. `updated` frontmatter: manual, not derived from `contentHash`.
3. MCP package lives in a new folder in this repo.
