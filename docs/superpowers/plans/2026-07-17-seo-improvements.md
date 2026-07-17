# SEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make arkana.blog fully crawlable and correctly described to search engines: sitemap/robots, no junk pages, correct hreflang, server-rendered structured data, real content at every indexable URL.

**Architecture:** The site is a Next.js 15 App Router **static export** (`output: "export"`, `trailingSlash: true`) deployed to GitHub Pages. All fixes must work at build time — no runtime server. A new translation-availability helper drives static params, hreflang, and the sitemap so the three stay consistent.

**Tech Stack:** Next.js 15.3 (App Router, static export), TypeScript strict, Tailwind 4, pnpm. Content is markdown in `src/content/{en,es,pt}/<folder>/<slug>.md` with gray-matter frontmatter.

## Global Constraints

- **No test suite exists.** The verification gate for every task is: `pnpm run build` succeeds, grep assertions against `out/` pass, and `pnpm run lint` passes. Run all three before each commit.
- **`pnpm run build` corrupts a running dev server** (both share `out/`). If Frank's dev server is running on port 3333, warn him it will need a restart afterward. NEVER kill or restart his server yourself.
- Local builds bake `http://localhost:3333` into absolute URLs (from `.env` `NEXT_PUBLIC_SITE_URL`). This is expected — production gets `https://arkana.blog` from `.github/workflows/deploy.yml`. Grep assertions below match URL *paths*, not hosts.
- Built URLs end with a trailing slash (`/en/blog/.../`); Next applies this to canonical/hreflang automatically from the un-slashed strings we pass.
- Work on branch `feature/seo-improvements`. Conventional commits (`feat:`, `fix:`, `chore:`). Do not push unless Frank asks.
- TypeScript strict, no `any`, named exports (exception: Next.js requires default exports for pages/layouts/route metadata files — follow framework convention there).
- Languages are `en`, `es`, `pt` (see `src/lib/i18n-config.ts`: `languages`, `defaultLanguage = "en"`, type `Locale`).
- Do not touch `.env`, CI files, or dependencies.

---

### Task 1: Branch + translation-availability helper

The root cause of the junk-page and hreflang problems: nothing knows which languages a post actually exists in. This helper becomes the single source of truth, consumed by Tasks 2, 3, and 5.

**Files:**
- Create: `src/lib/posts/translations.ts`

**Interfaces:**
- Consumes: `languages`, `Locale` from `src/lib/i18n-config.ts`
- Produces: `getPostPaths(): Promise<PostPath[]>` where `PostPath = { folder: string; slug: string; languages: Locale[] }`, and `getAvailablePostLanguages(folder: string, slug: string): Promise<Locale[]>`

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feature/seo-improvements
```

- [ ] **Step 2: Write `src/lib/posts/translations.ts`**

```ts
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { languages, type Locale } from "@/lib/i18n-config";

export interface PostPath {
  folder: string;
  slug: string;
  languages: Locale[];
}

async function isVisiblePost(filePath: string): Promise<boolean> {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const { data } = matter(fileContent);
    return data.visible !== false;
  } catch {
    return false;
  }
}

// Scans src/content/<lang>/<folder>/<slug>.md and reports, per unique
// folder/slug, which languages have a visible translation.
export async function getPostPaths(): Promise<PostPath[]> {
  const contentPath = path.join(process.cwd(), "src", "content");
  const found = new Map<string, Set<Locale>>();

  for (const lang of languages) {
    const langPath = path.join(contentPath, lang);
    let folders: string[];
    try {
      folders = await fs.readdir(langPath);
    } catch {
      continue;
    }

    for (const folder of folders) {
      const folderPath = path.join(langPath, folder);
      const stat = await fs.stat(folderPath);
      if (!stat.isDirectory()) continue;

      const files = await fs.readdir(folderPath);
      for (const file of files) {
        if (!file.endsWith(".md")) continue;
        if (!(await isVisiblePost(path.join(folderPath, file)))) continue;

        const key = `${folder}/${file.replace(/\.md$/, "")}`;
        const langs = found.get(key) ?? new Set<Locale>();
        langs.add(lang);
        found.set(key, langs);
      }
    }
  }

  return Array.from(found.entries()).map(([key, langs]) => {
    const [folder, slug] = key.split("/");
    return {
      folder,
      slug,
      languages: languages.filter((lang) => langs.has(lang)),
    };
  });
}

export async function getAvailablePostLanguages(
  folder: string,
  slug: string
): Promise<Locale[]> {
  const posts = await getPostPaths();
  const match = posts.find(
    (post) => post.folder === folder && post.slug === slug
  );
  return match?.languages ?? [];
}
```

- [ ] **Step 3: Verify it compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no output, exit 0.

- [ ] **Step 4: Lint and commit**

```bash
pnpm run lint
git add src/lib/posts/translations.ts
git commit -m "feat: add translation-availability helper for posts"
```

---

### Task 2: Stop generating "Post Not Found" pages

Article static params currently cross-product all 3 languages × all 90 articles; ~94 combos have no translation and ship as indexable pages titled "Post Not Found".

**Files:**
- Modify: `src/app/[lang]/blog/[folder]/[slug]/static-params.ts` (replace entire file)

**Interfaces:**
- Consumes: `getPostPaths()` from Task 1; `PageParams` (`{ lang: string; folder: string; slug: string }`) from `./page`
- Produces: nothing new — same `generateStaticParams` export, fewer params

- [ ] **Step 1: Replace the file contents**

```ts
import { PageParams } from "./page";
import { getPostPaths } from "@/lib/posts/translations";

export async function generateStaticParams(): Promise<PageParams[]> {
  const posts = await getPostPaths();

  // Only emit params for translations that actually exist — a missing
  // combination must 404, not render an indexable "Post Not Found" page.
  return posts.flatMap((post) =>
    post.languages.map((lang) => ({
      lang,
      folder: post.folder,
      slug: post.slug,
    }))
  );
}
```

- [ ] **Step 2: Build**

Run: `pnpm run build`
Expected: succeeds. (Remind Frank his dev server needs a restart if it was running.)

- [ ] **Step 3: Verify junk pages are gone**

```bash
grep -rl "Post Not Found" out/es out/pt out/en | wc -l
test ! -d out/es/blog/the-zk-chronicles/arithmetization && echo "OK: no es arithmetization"
test -d out/es/blog/the-zk-chronicles/circuits-part-1 && echo "OK: translated es post still built"
```

Expected: `0`, then both `OK` lines.

- [ ] **Step 4: Lint and commit**

```bash
pnpm run lint
git add "src/app/[lang]/blog/[folder]/[slug]/static-params.ts"
git commit -m "fix: only build article pages for existing translations"
```

---

### Task 3: Existence-aware hreflang, x-default, og:locale

`generateBaseMetadata` emits hreflang for all 3 languages unconditionally (pointing at 404s for untranslated posts after Task 2), has no `x-default`, and emits `og:locale` as `"en"` instead of `en_US`.

**Files:**
- Modify: `src/lib/metadata-utils.ts`
- Modify: `src/app/[lang]/blog/[folder]/[slug]/metadata.ts`

**Interfaces:**
- Consumes: `getAvailablePostLanguages` from Task 1; `defaultLanguage`, `languages` from `src/lib/i18n-config.ts`
- Produces: `BaseMetadataOptions` gains optional `availableLanguages?: string[]` (defaults to all languages). Task 9 adds `canonicalPath` to the same options — keep the interface open for it.

- [ ] **Step 1: Update `src/lib/metadata-utils.ts`**

Add imports at the top:

```ts
import { defaultLanguage, languages as allLanguages } from "@/lib/i18n-config";
```

Add below the imports:

```ts
const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
  pt: "pt_BR",
};
```

Add to `BaseMetadataOptions`:

```ts
  availableLanguages?: string[]; // languages this page exists in; defaults to all
```

Destructure it in the function signature (`availableLanguages,` alongside the others). Then replace the hard-coded `languages` object inside `alternates` with a computed one. Before the `const metadata: Metadata = {` line add:

```ts
  const available = availableLanguages ?? [...allLanguages];
  const languageAlternates: Record<string, string> = {};
  for (const language of available) {
    languageAlternates[language] =
      `${SITE_URL}/${language}${path ? `/${path}` : ""}`;
  }
  if (available.includes(defaultLanguage)) {
    languageAlternates["x-default"] =
      `${SITE_URL}/${defaultLanguage}${path ? `/${path}` : ""}`;
  }
```

and change the `alternates` block to:

```ts
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
```

Finally change `locale: lang,` inside `openGraph` to:

```ts
      locale: OG_LOCALES[lang] ?? lang,
```

- [ ] **Step 2: Pass availability from article metadata**

In `src/app/[lang]/blog/[folder]/[slug]/metadata.ts`, add the import:

```ts
import { getAvailablePostLanguages } from "@/lib/posts/translations";
```

Inside `generateMetadata`, after `const post = await getPostBySlug(...)`, add:

```ts
  const availableLanguages = await getAvailablePostLanguages(folder, slug);
```

and add `availableLanguages,` to the `generateBaseMetadata({ ... })` call.

- [ ] **Step 3: Build and verify**

```bash
pnpm run build
# en-only post: exactly en + x-default, no es/pt
grep -o 'hrefLang="[^"]*"' out/en/blog/the-zk-chronicles/arithmetization/index.html | sort -u
# fully translated post: en, es, pt, x-default
grep -o 'hrefLang="[^"]*"' out/en/blog/cryptography-101/where-to-start/index.html | sort -u
grep -o 'og:locale" content="[^"]*"' out/en/blog/cryptography-101/where-to-start/index.html
```

Expected: first grep → `hrefLang="en"` and `hrefLang="x-default"` only; second → all four; third → `og:locale" content="en_US"`.

- [ ] **Step 4: Lint and commit**

```bash
pnpm run lint
git add src/lib/metadata-utils.ts "src/app/[lang]/blog/[folder]/[slug]/metadata.ts"
git commit -m "fix: existence-aware hreflang with x-default and proper og:locale"
```

---

### Task 4: robots.txt

**Files:**
- Create: `src/app/robots.ts`

**Interfaces:**
- Consumes: `SITE_URL` from `src/lib/site-config.ts`
- Produces: `out/robots.txt` at build time

- [ ] **Step 1: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Build and verify**

```bash
pnpm run build && cat out/robots.txt
```

Expected: `User-Agent: *`, `Allow: /`, and a `Sitemap:` line.

- [ ] **Step 3: Lint and commit**

```bash
pnpm run lint
git add src/app/robots.ts
git commit -m "feat: add robots.txt"
```

---

### Task 5: sitemap.xml

**Files:**
- Create: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getPostPaths()` (Task 1); `getAllPosts(lang)` from `src/lib/posts` (returns `PostPreview[]` with `slug` = `folder/file`, `date`); `readingLists: Record<string, ReadingList[]>` from `src/lib/reading-lists`; `writers: Record<string, Writer>` from `src/lib/writers`; `POSTS_PER_PAGE` from `src/app/[lang]/blog/page/[page]/static-params`
- Produces: `out/sitemap.xml`. Tasks 10–11 append more entries to this file's `staticPaths` / tag section.

Note: `/{lang}/blog/` and `/{lang}/writers/{slug}/` are included here and become real (non-redirect) pages in Tasks 9–10 on the same branch. Auth pages (`login`, `signup`, `auth/callback`) are deliberately excluded.

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { defaultLanguage, languages } from "@/lib/i18n-config";
import { getPostPaths } from "@/lib/posts/translations";
import { getAllPosts } from "@/lib/posts";
import { readingLists } from "@/lib/reading-lists";
import { writers } from "@/lib/writers";
import { POSTS_PER_PAGE } from "./[lang]/blog/page/[page]/static-params";

function url(lang: string, path = ""): string {
  return `${SITE_URL}/${lang}${path ? `/${path}` : ""}/`;
}

function alternatesFor(
  path: string,
  availableLanguages: readonly string[]
): { languages: Record<string, string> } {
  const entries: Record<string, string> = {};
  for (const lang of availableLanguages) {
    entries[lang] = url(lang, path);
  }
  if (availableLanguages.includes(defaultLanguage)) {
    entries["x-default"] = url(defaultLanguage, path);
  }
  return { languages: entries };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static section pages, present in every language
  const staticPaths = ["", "blog", "faq", "reading-lists", "writers"];
  for (const path of staticPaths) {
    for (const lang of languages) {
      entries.push({ url: url(lang, path), alternates: alternatesFor(path, languages) });
    }
  }

  // Blog pagination + per-post dates, per language
  const dates = new Map<string, string>();
  for (const lang of languages) {
    const posts = await getAllPosts(lang);
    for (const post of posts) {
      dates.set(`${lang}:${post.slug}`, post.date);
    }
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    for (let page = 1; page <= totalPages; page++) {
      entries.push({ url: url(lang, `blog/page/${page}`) });
    }
  }

  // Articles — only languages with an existing translation
  const postPaths = await getPostPaths();
  for (const post of postPaths) {
    const path = `blog/${post.folder}/${post.slug}`;
    for (const lang of post.languages) {
      const date = dates.get(`${lang}:${post.folder}/${post.slug}`);
      entries.push({
        url: url(lang, path),
        ...(date ? { lastModified: new Date(date) } : {}),
        alternates: alternatesFor(path, post.languages),
      });
    }
  }

  // Reading lists (ids can differ per language — no alternates)
  for (const lang of languages) {
    for (const list of readingLists[lang] ?? []) {
      entries.push({ url: url(lang, `reading-lists/${list.id}`) });
    }
  }

  // Writer profiles
  for (const writer of Object.values(writers)) {
    if (writer.visible === false) continue;
    const path = `writers/${writer.slug}`;
    for (const lang of languages) {
      entries.push({ url: url(lang, path), alternates: alternatesFor(path, languages) });
    }
  }

  return entries;
}
```

- [ ] **Step 2: Build and verify**

```bash
pnpm run build
grep -c "<loc>" out/sitemap.xml
grep -c "blog/cryptography-101/where-to-start" out/sitemap.xml
grep -c "es/blog/the-zk-chronicles/arithmetization" out/sitemap.xml || echo "OK: absent"
```

Expected: several hundred `<loc>` entries; where-to-start present (≥3 incl. alternates); the untranslated es URL absent (`OK: absent`).

- [ ] **Step 3: Lint and commit**

```bash
pnpm run lint
git add src/app/sitemap.ts
git commit -m "feat: add sitemap.xml with hreflang alternates"
```

---

### Task 6: Fix the empty root page and missing `<html lang>`

`src/app/page.tsx`'s `redirect("/en")` builds an empty `__next_error__` shell at `/`, and the root layout sits above `[lang]` so `params.lang` is undefined → built pages emit `<html>` with **no lang attribute**. Fix both by making `[lang]/layout.tsx` the root layout (the documented Next.js i18n pattern) and serving a static redirect file at `/`.

**Files:**
- Create: `src/app/[lang]/layout.tsx` (contents of current `src/app/layout.tsx`, adjusted)
- Delete: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `public/index.html`

**Interfaces:**
- Consumes: everything the current root layout imports
- Produces: `[lang]/layout.tsx` owns `<html>`/`<body>` and the site-wide `metadata` export. Tasks 7, 12 edit this file.

- [ ] **Step 1: Create `src/app/[lang]/layout.tsx`**

Copy `src/app/layout.tsx` verbatim, then make exactly these changes:
1. `import "./globals.css";` → `import "../globals.css";`
2. The `lang` param now resolves correctly since this layout lives inside `[lang]` — no code change needed for `<html lang={lang}>`, it just starts working.

Everything else (metadata export, JSON-LD objects, providers, analytics script) moves unchanged.

- [ ] **Step 2: Delete the old root files**

```bash
git rm src/app/layout.tsx src/app/page.tsx
```

- [ ] **Step 3: Create `public/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Arkana</title>
    <meta http-equiv="refresh" content="0; url=/en/" />
    <link rel="canonical" href="https://arkana.blog/en/" />
    <style>
      html { background-color: hsl(260, 30%, 8%); color: #e8e4f0; font-family: sans-serif; }
      body { display: grid; place-items: center; min-height: 100vh; margin: 0; }
      a { color: #b39ddb; }
    </style>
  </head>
  <body>
    <p><a href="/en/">Continue to Arkana &rarr;</a></p>
  </body>
</html>
```

(The prod host is hard-coded — a static file can't read env vars; this is the only place that's acceptable.)

- [ ] **Step 4: Build and verify**

```bash
pnpm run build
grep -o '<html[^>]*lang="en"' out/en/index.html
grep -o '<html[^>]*lang="es"' out/es/index.html
grep -c "__next_error__" out/index.html || echo "OK: no error shell"
grep -c 'url=/en/' out/index.html
```

Expected: lang attributes present for both locales; no `__next_error__` at root; the meta refresh present.

**Known risk:** if `next build` errors with "missing root layout" for the auto-generated `/_not-found` route, stop and surface it — do not improvise a second root layout. (Research fallback: a `src/app/[lang]/not-found.tsx` usually satisfies it.)

- [ ] **Step 5: Lint and commit**

```bash
pnpm run lint
git add -A src/app public/index.html
git commit -m "fix: real html lang attribute and static root redirect page"
```

---

### Task 7: Server-render all JSON-LD + schema corrections

All schemas are injected via `next/script` (after hydration) so they're absent from the built HTML. Also: the `WebSite` schema advertises a `/search` page that doesn't exist, and `BlogPosting.publisher.logo` points to `/images/logo.png` which 404s (real file: `/logo.png`).

**Files:**
- Modify: `src/app/[lang]/layout.tsx` (org + website schemas)
- Modify: `src/features/posts/index.tsx` (article schema)
- Modify: `src/features/reading-lists/post/index.tsx` (article schema)

**Interfaces:** none new — same rendered output, now in static HTML.

- [ ] **Step 1: Replace `<Script>` JSON-LD with plain `<script>` in the layout**

In `src/app/[lang]/layout.tsx`, replace the two blocks:

```tsx
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
```

with:

```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
```

Keep the `Script` import — the Simple Analytics tag still uses it.

- [ ] **Step 2: Remove the phantom SearchAction**

In the same file, delete the entire `potentialAction: { ... }` block from `websiteJsonLd` (it targets `${baseUrl}/search?q=...`, a page that doesn't exist).

- [ ] **Step 3: Same `<Script>` → `<script>` swap in the two article components**

In `src/features/posts/index.tsx` and `src/features/reading-lists/post/index.tsx`, replace:

```tsx
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
```

with:

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
```

and remove the now-unused `import Script from "next/script";` from both files.

- [ ] **Step 4: Fix the publisher logo path**

In both files, inside `jsonLd.publisher.logo`, change:

```ts
        url: withSiteUrl("/images/logo.png"),
```

to:

```ts
        url: withSiteUrl("/logo.png"),
```

- [ ] **Step 5: Build and verify schemas are in the raw HTML**

```bash
pnpm run build
python3 - <<'EOF'
import re, json
for path, expected in [
    ("out/en/index.html", {"EducationalOrganization", "WebSite"}),
    ("out/en/blog/cryptography-101/where-to-start/index.html", {"BlogPosting"}),
]:
    html = open(path).read()
    types = set()
    for s in re.findall(r'application/ld\+json">(.*?)</script>', html, re.S):
        types.add(json.loads(s)["@type"])
    assert expected <= types, f"{path}: {types}"
    assert "potentialAction" not in html or "SearchAction" not in html
print("OK: schemas server-rendered, SearchAction gone")
EOF
```

Expected: `OK: schemas server-rendered, SearchAction gone`

- [ ] **Step 6: Lint and commit**

```bash
pnpm run lint
git add "src/app/[lang]/layout.tsx" src/features/posts/index.tsx src/features/reading-lists/post/index.tsx
git commit -m "fix: server-render JSON-LD, drop phantom SearchAction, fix publisher logo path"
```

---

### Task 8: Generate the missing apple-touch-icon

The layout's `icons.apple` references `/apple-touch-icon.png`, which doesn't exist in `public/` (404 in production).

**Files:**
- Create: `public/apple-touch-icon.png` (generated, committed as a binary)

- [ ] **Step 1: Generate a 180×180 icon from the logo** (sharp is already a devDependency; background = the site's dark purple `hsl(260,30%,8%)` ≈ rgb(17,14,27))

```bash
node -e "
const sharp = require('sharp');
sharp('public/logo.png')
  .resize(140, 140, { fit: 'contain', background: { r: 17, g: 14, b: 27, alpha: 1 } })
  .extend({ top: 20, bottom: 20, left: 20, right: 20, background: { r: 17, g: 14, b: 27, alpha: 1 } })
  .flatten({ background: { r: 17, g: 14, b: 27 } })
  .png()
  .toFile('public/apple-touch-icon.png')
  .then(() => console.log('written'));
"
```

- [ ] **Step 2: Verify dimensions and reference**

```bash
node -e "require('sharp')('public/apple-touch-icon.png').metadata().then(m => console.log(m.width, m.height))"
pnpm run build && grep -c "apple-touch-icon" out/en/index.html
```

Expected: `180 180`, then ≥1.

- [ ] **Step 3: Commit**

```bash
git add public/apple-touch-icon.png
git commit -m "fix: add missing apple-touch-icon"
```

---

### Task 9: Real page at `/[lang]/blog/` + canonical for page 1

`/[lang]/blog/` is a `redirect()` that builds as an empty error shell (generic title, no canonical, no h1). Render page 1's listing there instead, and canonicalize `/blog/page/1/` to `/blog/`.

**Files:**
- Modify: `src/lib/metadata-utils.ts` (add `canonicalPath` option)
- Modify: `src/app/[lang]/blog/page.tsx` (replace redirect with listing)
- Create: `src/app/[lang]/blog/metadata.ts`
- Modify: `src/app/[lang]/blog/page/[page]/metadata.ts` (page-1 canonical)

**Interfaces:**
- Consumes: `BlogPage` from `@/features/blog/list` (props: `lang, posts, allPosts, dictionary, currentPage?, totalPages?`); `MainLayout` from `@/components/layouts/main-layout`; `POSTS_PER_PAGE` from `./page/[page]/static-params`
- Produces: `BaseMetadataOptions.canonicalPath?: string` — when set, canonical, hreflang, and og:url are built from it instead of `path`. Task 10 reuses this.

- [ ] **Step 1: Add `canonicalPath` to `generateBaseMetadata`**

In `src/lib/metadata-utils.ts` add to `BaseMetadataOptions`:

```ts
  canonicalPath?: string; // canonical target when this URL is a duplicate (defaults to path)
```

Destructure it, then change the URL computations at the top of the function to:

```ts
  const effectivePath = canonicalPath ?? path;
  const fullPath = effectivePath ? `/${lang}/${effectivePath}` : `/${lang}`;
  const canonicalUrl = `${SITE_URL}${fullPath}`;
```

and in the `languageAlternates` loop (from Task 3), use `effectivePath` instead of `path`.

- [ ] **Step 2: Create `src/app/[lang]/blog/metadata.ts`**

```ts
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { generateBaseMetadata } from "@/lib/metadata-utils";

interface BlogIndexProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: BlogIndexProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return generateBaseMetadata({
    lang,
    path: "blog",
    title: `Arkana | ${dict.blog.title}`,
    description: dict.home.recentPosts.description,
    ogTitle: dict.blog.title,
    type: "website",
  });
}
```

- [ ] **Step 3: Replace `src/app/[lang]/blog/page.tsx`**

```tsx
import { MainLayout } from "@/components/layouts/main-layout";
import { BlogPage } from "@/features/blog/list";
import { getDictionary } from "@/lib/dictionaries";
import { getAllPosts } from "@/lib/posts";
import { POSTS_PER_PAGE } from "./page/[page]/static-params";

interface PageProps {
  params: Promise<PageParams>;
}

export interface PageParams {
  lang: string;
}

export { generateStaticParams } from "./static-params";
export { generateMetadata } from "./metadata";

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const allPosts = await getAllPosts(lang);
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  return (
    <MainLayout lang={lang}>
      <BlogPage
        lang={lang}
        posts={allPosts.slice(0, POSTS_PER_PAGE)}
        allPosts={allPosts}
        dictionary={dict}
        currentPage={1}
        totalPages={totalPages}
      />
    </MainLayout>
  );
}
```

(Note: `PageParams` was already implicitly used by `static-params.ts` via `./page` — keep the export.)

- [ ] **Step 4: Canonicalize page 1 to the blog index**

In `src/app/[lang]/blog/page/[page]/metadata.ts`, add to the `generateBaseMetadata` call:

```ts
    ...(pageNumber === 1 ? { canonicalPath: "blog" } : {}),
```

- [ ] **Step 5: Build and verify**

```bash
pnpm run build
grep -c "<h1" out/en/blog/index.html
grep -o 'rel="canonical" href="[^"]*"' out/en/blog/index.html
grep -o 'rel="canonical" href="[^"]*"' out/en/blog/page/1/index.html
grep -o 'rel="canonical" href="[^"]*"' out/en/blog/page/2/index.html
```

Expected: 1 h1; `/en/blog/` canonical on both the index **and** page 1; page 2 keeps `/en/blog/page/2/`.

- [ ] **Step 6: Lint and commit**

```bash
pnpm run lint
git add src/lib/metadata-utils.ts "src/app/[lang]/blog"
git commit -m "fix: render real blog index page and canonicalize page 1"
```

---

### Task 10: Real writer pages + reading-list post canonicals

Same two duplicates elsewhere: `/[lang]/writers/[slug]/` is a redirect shell to `page/1`, and reading-list post pages (`/reading-lists/[id]/[post]/`) self-canonicalize while duplicating full blog articles.

**Files:**
- Modify: `src/app/[lang]/writers/[slug]/page.tsx` (replace redirect with page-1 content)
- Modify: `src/app/[lang]/writers/[slug]/metadata.ts` (only if it doesn't already produce a canonical for `writers/{slug}` — read it first)
- Modify: `src/app/[lang]/writers/[slug]/page/[page]/metadata.ts` (page-1 → `canonicalPath: "writers/${slug}"`)
- Modify: `src/app/[lang]/reading-lists/[id]/[post]/metadata.ts` (canonical → blog article)

**Interfaces:**
- Consumes: `canonicalPath` from Task 9; `WriterPage` (default export) from `@/features/writers/view`; `getWriter` from `@/lib/writers`; `getPostsByAuthor` from `@/lib/posts`; `POSTS_PER_PAGE` from `./page/[page]/static-params`

- [ ] **Step 1: Replace `src/app/[lang]/writers/[slug]/page.tsx`**

Mirror the body of `src/app/[lang]/writers/[slug]/page/[page]/page.tsx` with `pageNumber = 1` (same imports, minus `notFound` page-number validation), keeping the existing `generateMetadata`/`generateStaticParams` re-exports:

```tsx
import { getWriter } from "@/lib/writers";
import { MainLayout } from "@/components/layouts/main-layout";
import WriterPage from "@/features/writers/view";
import { getPostsByAuthor } from "@/lib/posts";
import { getDictionary } from "@/lib/dictionaries";
import { notFound } from "next/navigation";
import { POSTS_PER_PAGE } from "./page/[page]/static-params";

interface WriterPageParams {
  lang: string;
  slug: string;
}

interface WriterPageProps {
  params: Promise<WriterPageParams>;
}

export { generateMetadata } from "./metadata";
export { generateStaticParams } from "./static-params";

export default async function Page({ params }: WriterPageProps) {
  const { lang, slug } = await params;

  const writer = await getWriter(slug);
  const dict = await getDictionary(lang);

  if (!writer) {
    notFound();
  }

  const allArticles = await getPostsByAuthor(slug, lang);
  const totalPages = Math.ceil(allArticles.length / POSTS_PER_PAGE);

  return (
    <MainLayout lang={lang}>
      <WriterPage
        lang={lang}
        writer={writer}
        articles={allArticles.slice(0, POSTS_PER_PAGE)}
        dictionary={dict}
        currentPage={1}
        totalPages={Math.max(1, totalPages)}
      />
    </MainLayout>
  );
}
```

- [ ] **Step 2: Canonicalize writer page 1**

In `src/app/[lang]/writers/[slug]/page/[page]/metadata.ts`, add to its `generateBaseMetadata` call (adapt to the file's actual param names — read it first):

```ts
    ...(pageNumber === 1 ? { canonicalPath: `writers/${slug}` } : {}),
```

- [ ] **Step 3: Point reading-list post pages at the blog article**

In `src/app/[lang]/reading-lists/[id]/[post]/metadata.ts`, add to the `generateBaseMetadata` call:

```ts
    canonicalPath: `blog/${postFromReadingList.slug}`,
```

(`postFromReadingList.slug` is the `folder/file` blog slug — already in scope.)

- [ ] **Step 4: Build and verify**

```bash
pnpm run build
grep -o 'rel="canonical" href="[^"]*"' out/en/writers/frank-mangone/index.html
grep -o 'rel="canonical" href="[^"]*"' out/en/writers/frank-mangone/page/1/index.html
f=$(find out/en/reading-lists -mindepth 2 -name index.html | head -1); echo "$f"
grep -o 'rel="canonical" href="[^"]*"' "$f"
grep -c "__next_error__" out/en/writers/frank-mangone/index.html || echo "OK: real page"
```

Expected: both writer URLs canonicalize to `/en/writers/frank-mangone/`; the reading-list post canonical contains `/blog/`; `OK: real page`.

- [ ] **Step 5: Lint and commit**

```bash
pnpm run lint
git add "src/app/[lang]/writers" "src/app/[lang]/reading-lists"
git commit -m "fix: real writer index pages and canonicalize reading-list article duplicates"
```

---

### Task 11: Crawlable tag hub pages

Tag browsing is a client-side `?tags=` filter — invisible to crawlers. Add static `/[lang]/blog/tags/[tag]/` pages, point tag chips at them, and list them in the sitemap. **Intentional behavior change (flag to Frank):** clicking a tag chip now lands on a dedicated tag page instead of the filtered blog grid.

**Files:**
- Create: `src/app/[lang]/blog/tags/[tag]/static-params.ts`
- Create: `src/app/[lang]/blog/tags/[tag]/metadata.ts`
- Create: `src/app/[lang]/blog/tags/[tag]/page.tsx`
- Modify: `src/features/blog/list/index.tsx` (optional `heading` prop)
- Modify: `src/components/ui/tag.tsx` (navigate to tag page)
- Modify: `src/app/sitemap.ts` (tag URLs)

**Interfaces:**
- Consumes: `getAllPosts`, `getTagDisplayName(tag, lang)` from `@/lib/tags`, `BlogPage`, `generateBaseMetadata`
- Produces: `getTagsForLanguage(lang: string): Promise<string[]>` (exported from the new static-params file, reused by sitemap); `BlogPage` gains `heading?: string`

- [ ] **Step 1: Create `static-params.ts`**

```ts
import { languages } from "@/lib/i18n-config";
import { getAllPosts } from "@/lib/posts";

export interface TagPageParams {
  lang: string;
  tag: string;
}

export async function getTagsForLanguage(lang: string): Promise<string[]> {
  const posts = await getAllPosts(lang);
  return Array.from(new Set(posts.flatMap((post) => post.tags))).sort();
}

export async function generateStaticParams(): Promise<TagPageParams[]> {
  const params: TagPageParams[] = [];
  for (const lang of languages) {
    for (const tag of await getTagsForLanguage(lang)) {
      params.push({ lang, tag });
    }
  }
  return params;
}
```

- [ ] **Step 2: Create `metadata.ts`**

```ts
import { Metadata } from "next";
import { languages } from "@/lib/i18n-config";
import { generateBaseMetadata } from "@/lib/metadata-utils";
import { getTagDisplayName } from "@/lib/tags";
import { getTagsForLanguage } from "./static-params";

interface TagPageProps {
  params: Promise<{ lang: string; tag: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { lang, tag } = await params;
  const displayName = getTagDisplayName(tag, lang);

  const availableLanguages: string[] = [];
  for (const language of languages) {
    if ((await getTagsForLanguage(language)).includes(tag)) {
      availableLanguages.push(language);
    }
  }

  return generateBaseMetadata({
    lang,
    path: `blog/tags/${tag}`,
    title: `Arkana | ${displayName}`,
    description: `Articles about ${displayName} on Arkana.`,
    ogTitle: displayName,
    type: "website",
    availableLanguages,
  });
}
```

- [ ] **Step 3: Create `page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layouts/main-layout";
import { BlogPage } from "@/features/blog/list";
import { getDictionary } from "@/lib/dictionaries";
import { getAllPosts } from "@/lib/posts";
import { getTagDisplayName } from "@/lib/tags";

interface TagPageProps {
  params: Promise<{ lang: string; tag: string }>;
}

export { generateStaticParams } from "./static-params";
export { generateMetadata } from "./metadata";

export default async function Page({ params }: TagPageProps) {
  const { lang, tag } = await params;
  const allPosts = await getAllPosts(lang);
  const taggedPosts = allPosts.filter((post) => post.tags.includes(tag));

  if (taggedPosts.length === 0) {
    return notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <MainLayout lang={lang}>
      <BlogPage
        lang={lang}
        posts={taggedPosts}
        allPosts={allPosts}
        dictionary={dict}
        currentPage={1}
        totalPages={1}
        heading={getTagDisplayName(tag, lang)}
      />
    </MainLayout>
  );
}
```

- [ ] **Step 4: Add the `heading` prop to `BlogPage`**

In `src/features/blog/list/index.tsx`: add `heading?: string;` to `BlogPageProps`, destructure it, and change the `<h1>` line to render `{heading ?? dictionary.blog.title}`. Update the breadcrumbs so tag pages get a two-level trail — add `import { withLocalePath } from "@/lib/site-config";` and change the `items` prop to:

```tsx
          items={
            heading
              ? [
                  { label: dictionary.blog.title, href: withLocalePath(lang, "blog") },
                  { label: heading },
                ]
              : [{ label: dictionary.blog.title }]
          }
```

(Check `Breadcrumbs`' item type first — `href` is how the article page passes links to it, see `src/features/posts/index.tsx`.)

- [ ] **Step 5: Point tag chips at the tag pages**

In `src/components/ui/tag.tsx`, change the `handleClick` navigation line to:

```ts
    window.location.assign(
      withLocalePath(lang, `blog/tags/${encodeURIComponent(tag)}`)
    );
```

Also update the comment above it — the destination is now the static tag page, not the `?tags=` filter.

- [ ] **Step 6: Add tag URLs to the sitemap**

In `src/app/sitemap.ts`, add the import:

```ts
import { getTagsForLanguage } from "./[lang]/blog/tags/[tag]/static-params";
```

and append before `return entries;`:

```ts
  // Tag hub pages
  for (const lang of languages) {
    for (const tag of await getTagsForLanguage(lang)) {
      entries.push({ url: url(lang, `blog/tags/${tag}`) });
    }
  }
```

- [ ] **Step 7: Build and verify**

```bash
pnpm run build
ls out/en/blog/tags | head -5
t=$(ls out/en/blog/tags | head -1)
grep -o "<h1[^>]*>[^<]*" "out/en/blog/tags/$t/index.html"
grep -c "blog/tags/$t" out/sitemap.xml
```

Expected: tag directories exist; the h1 shows the tag display name (not "Blog"); the sitemap contains the tag URL.

- [ ] **Step 8: Lint and commit**

```bash
pnpm run lint
git add "src/app/[lang]/blog/tags" src/features/blog/list/index.tsx src/components/ui/tag.tsx src/app/sitemap.ts
git commit -m "feat: static tag hub pages with crawlable URLs"
```

---

### Task 12: RSS feeds

**Files:**
- Create: `src/app/[lang]/rss.xml/route.ts`
- Modify: `src/app/[lang]/layout.tsx` (feed `<link>` in head)

**Interfaces:**
- Consumes: `getAllPosts(lang)`, `languages`, `SITE_URL`
- Produces: `out/{en,es,pt}/rss.xml`

- [ ] **Step 1: Create `src/app/[lang]/rss.xml/route.ts`**

```ts
import { getAllPosts } from "@/lib/posts";
import { languages } from "@/lib/i18n-config";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const posts = (await getAllPosts(lang)).slice(0, 30);

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/${lang}/blog/${post.slug}/</link>
      <guid>${SITE_URL}/${lang}/blog/${post.slug}/</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Arkana</title>
    <link>${SITE_URL}/${lang}/</link>
    <description>Cryptography, blockchain and mathematics, explained clearly.</description>
    <language>${lang}</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

**Known risk:** if static export rejects `generateStaticParams` in a route handler, stop and surface it (fallback: a post-build script wired as `"build": "next build && node scripts/generate-rss.mjs"` — but confirm with Frank before adding a script file).

- [ ] **Step 2: Advertise the feed in the layout head**

In `src/app/[lang]/layout.tsx`, inside `<head>` after the manifest link, add:

```tsx
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Arkana RSS"
          href={`/${lang}/rss.xml`}
        />
```

- [ ] **Step 3: Build and verify**

```bash
pnpm run build
head -5 out/en/rss.xml
grep -c "<item>" out/en/rss.xml
grep -c 'application/rss+xml' out/en/index.html
```

Expected: valid XML header; up to 30 items; the head link present.

- [ ] **Step 4: Lint and commit**

```bash
pnpm run lint
git add "src/app/[lang]/rss.xml" "src/app/[lang]/layout.tsx"
git commit -m "feat: per-language RSS feeds"
```

---

### Task 13: Default metadata polish

The site-wide fallback description is "Where technology meets clarity." (too thin to earn the SERP snippet), the `keywords` meta is dead weight (ignored by all major engines), and the layout-level hreflang block lacks `x-default`.

**Files:**
- Modify: `src/app/[lang]/layout.tsx` (the static `metadata` export)

- [ ] **Step 1: Edit the `metadata` export**

1. Change `description` to:

```ts
  description:
    "Learn cryptography, blockchain technology, and mathematics with clear, beginner-friendly tutorials — zero-knowledge proofs, elliptic curves, smart contracts, and more.",
```

2. Delete the entire `keywords: [ ... ]` array. **Intentional removal** — the tag is ignored by Google/Bing; per-article keywords from frontmatter stay (harmless, zero maintenance).
3. In `alternates.languages`, add:

```ts
      "x-default": "/en",
```

- [ ] **Step 2: Build and verify**

```bash
pnpm run build
grep -c 'name="keywords"' out/en/index.html || echo "OK: keywords gone from layout defaults"
grep -o 'hrefLang="x-default"[^/]*' out/en/index.html | head -1
```

Expected: home page keywords come only from page-level metadata (or `OK` if none); `x-default` present.

- [ ] **Step 3: Lint and commit**

```bash
pnpm run lint
git add "src/app/[lang]/layout.tsx"
git commit -m "chore: stronger default description, x-default hreflang, drop keywords meta"
```

---

### Task 14: BreadcrumbList, Person, and FAQPage schemas

The breadcrumb UI exists with no matching schema; writer pages have no `Person`; the FAQ page has no `FAQPage`.

**Files:**
- Modify: `src/features/posts/index.tsx` (BreadcrumbList)
- Modify: `src/features/writers/view/index.tsx` — or wherever the default `WriterPage` export lives; locate with `ls src/features/writers/view` (Person)
- Modify: `src/features/faq/index.tsx` (FAQPage)

**Interfaces:**
- Consumes: existing `dict`, `writer` (`Writer` type from `src/lib/writers/types.ts`), `dict.faq.{wallet,privacy,security}.{question,answer}` from `src/lib/dictionaries/{en,es,pt}.json`

- [ ] **Step 1: BreadcrumbList on articles**

In `src/features/posts/index.tsx`, after the existing `jsonLd` object, add:

```ts
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Arkana",
        item: `${baseUrl}${withLocalePath(lang)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dict.blog.title,
        item: `${baseUrl}${withLocalePath(lang, "blog")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.metadata.title,
        item: postUrl,
      },
    ],
  };
```

and render it next to the article schema script:

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
```

- [ ] **Step 2: Person schema on writer pages**

In the `WriterPage` feature component (`src/features/writers/view/...` — it receives `lang` and `writer: Writer` as props), build and render:

```ts
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: writer.name,
    url: withSiteUrl(withLocalePath(lang, `writers/${writer.slug}`)),
    image: withSiteUrl(writer.avatarUrl),
    ...(writer.bio?.[lang] ? { description: writer.bio[lang] } : {}),
    ...(writer.organization
      ? {
          worksFor: {
            "@type": "Organization",
            name: writer.organization.name,
            url: writer.organization.url,
          },
        }
      : {}),
    sameAs: Object.values(writer.social ?? {}).filter((link) =>
      link.startsWith("http")
    ),
  };
```

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
```

Imports: `withSiteUrl`, `withLocalePath` from `@/lib/site-config`. If the component is a client component (`"use client"`), put the script in `src/app/[lang]/writers/[slug]/page.tsx` instead, as a sibling of `<WriterPage />` inside `<MainLayout>` (build `writer` data is already there).

- [ ] **Step 3: FAQPage schema**

In `src/features/faq/index.tsx` (the `FAQPage` component, which already has `dict`), add:

```ts
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [dict.faq.wallet, dict.faq.privacy, dict.faq.security].map(
      (entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: { "@type": "Answer", text: entry.answer },
      })
    ),
  };
```

and render the same `<script type="application/ld+json">` inside the returned `<article>`.

- [ ] **Step 4: Build and verify**

```bash
pnpm run build
python3 - <<'EOF'
import re, json
checks = [
    ("out/en/blog/cryptography-101/where-to-start/index.html", "BreadcrumbList"),
    ("out/en/writers/frank-mangone/index.html", "Person"),
    ("out/en/faq/index.html", "FAQPage"),
]
for path, expected in checks:
    html = open(path).read()
    types = {json.loads(s)["@type"] for s in re.findall(r'application/ld\+json">(.*?)</script>', html, re.S)}
    assert expected in types, f"{path}: {types}"
print("OK: all three schemas present")
EOF
```

Expected: `OK: all three schemas present`

- [ ] **Step 5: Lint, final full check, commit**

```bash
pnpm run lint
pnpm run build
git add src/features
git commit -m "feat: BreadcrumbList, Person, and FAQPage structured data"
```

---

## Post-plan notes (not tasks)

- **Deliberately out of scope (YAGNI):** responsive image generation via sharp (revisit only if PageSpeed data demands it); `dateModified` in BlogPosting (frontmatter has no `updated` field to source it from); pagination `rel=prev/next` (deprecated by Google).
- After merging + deploying, submit `https://arkana.blog/sitemap.xml` in Google Search Console and validate one article with the Rich Results Test.
- The local `out/` will contain `localhost:3333` URLs throughout — production correctness is guaranteed by `deploy.yml`'s `NEXT_PUBLIC_SITE_URL`.
