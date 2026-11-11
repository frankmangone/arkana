# Making Arkana attractive for agentic traffic

Plan agreed 2026-11-11. The site is a static export, so everything below is
generated at build time (route handlers with `generateStaticParams`, like
`rss.xml`). One shared module turns a post into clean agent-readable markdown
and one function lists the public posts; markdown files, `llms.txt`, the JSON
index and JSON-LD all read from them so they can't drift apart.

Status: **Phases 0 and 1 done** (verified with a full static export: one
`index.md` per visible post, none for hidden posts, 187 files / 3.9 MB). The
rest is not started.

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

## Phase 2: `llms.txt`

- `/llms.txt`: what Arkana is, then each series with its articles and one-line
  descriptions, linking to the `.md` versions. English first, es/pt sections.
- `/{lang}/llms-full.txt`: every article for that language (per language
  because the combined file could be several MB). `llms.txt` links to it.

## Phase 3: Article JSON-LD and breadcrumbs

- `BlogPosting` on post pages (`features/posts` and the reading-list post
  page): `headline`, `description`, `datePublished`, `inLanguage`, `keywords`,
  `author` (Person, linked to the writer page), `publisher` (existing
  Organization), `isPartOf` (series), and `abstract` = the key-concepts deck as
  plain text (the modal is client-only, so this is the only way crawlers see it).
- `BreadcrumbList`: Home, Blog, Series, Article.
- Helper in `lib/json-ld.ts`. Verify the series display name source.

## Phase 4: `robots.ts`

- Named rules for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User,
  PerplexityBot, Google-Extended, CCBot. Default: allow all (documents intent,
  changes nothing). One array, so blocking training crawlers later is one line.

## Phase 5: Self-describing pages

- Heading IDs: `AnchoredHeading` already slugifies (and supports `{#custom-id}`);
  check the IDs are stable and that the TOC uses the same ones.
- Optional `updated` frontmatter field, shown near the date and used as
  `dateModified`. Set manually (not auto-set from `contentHash`).
- No new visible "what you'll learn" block; `description` and the key-concepts
  deck already cover it.

## Phase 6: JSON index and MCP

- `/{lang}/posts.json` (`slug`, `title`, `description`, `tags`, `series`,
  `date`, `author`, `readingTime`, `url`, `markdownUrl`) and a small
  `/api/index.json` listing the languages. Generated from `getPublicPosts()`.
- Read `scripts/extract-search-data` and `search/` first: may be reusable.
- MCP server: a stdio npm package (`arkana-mcp`, new folder in this repo) that
  fetches `posts.json` and the `.md` files from arkana.blog and exposes
  `list_series`, `search_articles`, `get_article`. Keyword search only. Needs no
  hosting (`npx arkana-mcp`). A remote endpoint can come later.

## Phase 7: Verification and measurement

- Post-build script asserting the expected files exist in `out/` (`llms.txt`,
  one `.md` per visible post, `posts.json`) and that hidden posts have no `.md`,
  no index entry and no `llms.txt` mention.
- Manual: curl a few URLs, validate the JSON-LD, diff one `.md` against its
  article.
- Traffic: agents don't run the JS analytics; use host/CDN logs. `.md` and
  `llms.txt` hits are clean agent signal.

## Decisions taken (defaults)

1. Training bots: allow everything for now.
2. `updated` frontmatter: manual, not derived from `contentHash`.
3. MCP package lives in a new folder in this repo.
