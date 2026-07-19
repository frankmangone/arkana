# Dark Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every surface of arkana-frontend into the approved "Dark Editorial" design (spec: `docs/superpowers/specs/2026-07-14-dark-editorial-redesign-design.md`) while preserving all functionality, colors (hues), logo, and Space Grotesk.

**Architecture:** Token-led restyle in place. Task 1 builds the semantic token + utility vocabulary in `globals.css`; every later task restyles components in their existing files using ONLY that vocabulary. No logic, prop, dictionary-key, or route changes anywhere.

**Tech Stack:** Next.js 15 App Router (static export), Tailwind CSS 4 (CSS-first `@theme` config), shadcn/ui, react-markdown pipeline, custom canvas glyph components.

## Global Constraints

- Preserve exactly: all existing hue ramps in `globals.css` (`--primary-*` hsl(260), `--secondary-*` magenta, emerald/aquamarine/salmon/orange/bronze/sky, `--correct*`/`--incorrect*`), `public/logo.svg`/`logo.png`, Space Grotesk.
- Never change: hooks, services, API layer, i18n dictionary keys/wiring, the react-markdown component map + `DivSwitch` routing, `arkana-strip` hash pipeline (`preCalculatedHash`), wallet/auth flows, `next.config.ts` static export.
- No new dependencies. No new pages. `pnpm` only.
- Retire from layouts: 3D renders (`render.png`, `reading-list-render.png`, `solo.png`) and the full-page `arkana-background` grid. Keep glyph components (`arkana-pattern`, `arkana-strip`, auth `logo.tsx`) as restrained accents.
- Signature element: the content-hashed glyph strip = each article's "cryptographic fingerprint" — used as card art, article header band, and section-divider mark. Boldness lives there; everything else stays quiet.
- No tests exist; the gate for every task is `pnpm run build` passing + `pnpm run lint` clean + visual check in the final task.

## Design Vocabulary (single source of truth for all tasks)

**Semantic tokens** (defined in Task 1, exact values there): surfaces `--surface-page/raised/overlay`; ink `--ink-heading (#f8f5ff)/body (#e1dfe4)/muted/faint (#7f7e84)`; rules `--rule (white 8%)/rule-strong (white 16%)`; accent = `--primary-700`. All exposed to Tailwind as `bg-surface-*`, `text-ink-*`, `border-rule`, `border-rule-strong`.

**Recipes (use verbatim):**
- Eyebrow: `class="eyebrow"` (global class) — 11px, uppercase, `0.14em` tracking, weight 500, `--ink-muted`; accent variant `eyebrow text-primary-800`.
- Display title: `class="display-title"` — `clamp(2.5rem,5.5vw,4.25rem)`, line-height 1.05, `-0.02em` tracking, weight 700, `--ink-heading`.
- Section heading: `text-2xl md:text-3xl font-semibold tracking-tight text-ink-heading`.
- Hairline divider: `border-t border-rule`; framed meta rows: `border-y border-rule py-4`.
- Card: flat — `border border-rule bg-transparent rounded-md hover:border-rule-strong transition-colors` (no shadows anywhere).
- Primary button: `bg-primary-700 text-[#161226] hover:bg-primary-750 rounded-[4px] font-medium`.
- Quiet CTA: text link `text-primary-800 hover:text-primary-900` with trailing `→` (use `ArrowRight` lucide icon size 16, or literal arrow where icon import is overkill).
- Outline control: `border border-rule-strong text-ink-body hover:border-primary-700 hover:text-ink-heading rounded-[4px] bg-transparent`.
- Reading column: `max-w-[70ch] mx-auto`.
- Page container: `max-w-6xl mx-auto px-4 md:px-6 lg:px-8`.

## Task List

### Task 1: Foundation — globals.css + font tokens

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx` (font variable only)

**Interfaces:**
- Produces: Tailwind utilities `bg-surface-page|raised|overlay`, `text-ink-heading|body|muted|faint`, `border-rule|rule-strong`, global classes `.eyebrow`, `.display-title`; `--radius: 0.375rem`; working `font-sans`/`font-mono`.

- [ ] **Step 1**: In `layout.tsx`, give Space Grotesk a CSS variable (font itself unchanged):

```tsx
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});
// body:
<body className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
```

- [ ] **Step 2**: In `globals.css` `@theme inline`, replace the dead font tokens and add semantic color mappings:

```css
--font-sans: var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
--color-surface-page: var(--surface-page);
--color-surface-raised: var(--surface-raised);
--color-surface-overlay: var(--surface-overlay);
--color-ink-heading: var(--ink-heading);
--color-ink-body: var(--ink-body);
--color-ink-muted: var(--ink-muted);
--color-ink-faint: var(--ink-faint);
--color-rule: var(--rule);
--color-rule-strong: var(--rule-strong);
```

- [ ] **Step 3**: Add semantic tokens inside `.dark` (values chosen to match existing hues exactly):

```css
--surface-page: oklch(0.141 0.005 285.823);
--surface-raised: oklch(0.175 0.006 286);
--surface-overlay: oklch(0.23 0.008 286);
--ink-heading: #f8f5ff;   /* was a.nav-bar color */
--ink-body: #e1dfe4;      /* was hardcoded p color */
--ink-muted: #a9a6b2;
--ink-faint: #7f7e84;     /* was figcaption color */
--rule: rgba(255, 255, 255, 0.08);
--rule-strong: rgba(255, 255, 255, 0.16);
```

Also set `--radius: 0.375rem` in `:root`.

- [ ] **Step 4**: Rewrite the hardcoded element CSS at the same hues via tokens/ramps: `p`/`li` → `var(--ink-body)`; `strong` → `var(--ink-heading)`; KaTeX `#b79cea` → `var(--primary-800)` (scrollbar rgba stays, expressed from same); inline code `#c9b3f0` → `var(--primary-850)` bg `color-mix(in srgb, var(--primary-800) 15%, transparent)`, `font-family: var(--font-mono)`; blockquote → `border-left: 2px solid var(--primary-600); background: var(--surface-raised); color: var(--ink-body)`; figcaption → `var(--ink-faint)`; tables → borders `var(--rule-strong)`/`var(--rule)`, header `var(--surface-overlay)`, zebra `var(--surface-raised)`, no box-shadow, `border-radius: var(--radius)`; callouts keep their five hue anchors but flatten (2px left border, 10% tint backgrounds, `--ink-body` text); list markers → `var(--primary-800)` (unchanged); delete `.youtube-container` box-shadows (keep aspect wrapper); delete `a.nav-bar` rule (navbar restyled in Task 3).

- [ ] **Step 5**: Add the two global utility classes:

```css
.eyebrow {
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted);
}
.display-title {
  font-size: clamp(2.5rem, 5.5vw, 4.25rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 700;
  color: var(--ink-heading);
}
```

- [ ] **Step 6**: Update scroll offsets `100px → 88px` (both `scroll-padding-top` and `scroll-margin-top`) to match the new slim navbar (h-16 + rule + margin).
- [ ] **Step 7**: `pnpm run build` → passes. `pnpm run lint` → clean.
- [ ] **Step 8**: Commit `refactor: tokenize design foundation for dark editorial redesign`.

### Task 2: shadcn primitives

**Files:** Modify `src/components/ui/{button,card,badge,input,separator,dropdown-menu,avatar}.tsx`

**Interfaces:** Produces restyled variants consumed everywhere; variant NAMES must not change (callers keep working).

- [ ] Button: `default` → primary recipe; `outline` → outline recipe; `ghost` → `hover:bg-white/5 text-ink-body`; radius `rounded-[4px]`; remove shadows. Card: flat card recipe, kill `shadow-sm`. Badge: eyebrow-style chip — `border border-rule text-ink-muted uppercase tracking-[0.12em] text-[10px] rounded-[3px] px-2 py-0.5`. Input: `bg-transparent border-rule-strong focus-visible:border-primary-700 focus-visible:ring-0 rounded-[4px]`. Separator: `bg-rule`. DropdownMenu content: `bg-surface-overlay border-rule rounded-md shadow-none`.
- [ ] `pnpm run build` + `pnpm run lint` → pass. Commit `restyle: flat editorial shadcn primitives`.

### Task 3: Chrome — navbar, footer, layouts, backgrounds

**Files:** Modify `src/components/layouts/{navbar,main-layout,home-layout,auth-layout}.tsx`, `src/components/ui/footer.tsx`, `src/components/language-switcher.tsx`, `src/components/auth-button.tsx`. Possibly delete usage of `src/components/layouts/arkana-background.tsx`.

**Interfaces:** Consumes Task 1 vocabulary. Navbar total height must equal 64px (`h-16`) so the 88px scroll offset holds.

- [ ] Navbar: `<header className="sticky top-0 z-40 border-b border-rule bg-surface-page/80 backdrop-blur-md">`, inner `h-16` flex container (page container recipe); logo + lowercase `arkana` wordmark (`text-xl text-ink-heading`); desktop links in `eyebrow` style with `hover:text-ink-heading transition-colors`; LanguageSwitcher as minimal text control; AuthButton = outline recipe. Mobile dropdown unchanged functionally.
- [ ] Footer: hairline top rule; page container; grid `md:grid-cols-[2fr_1fr_1fr]` — brand column (logo mark + one-line tagline from dict), nav links column, social column; full-width `ArkanaStrip`-style thin glyph band above the small print row (`text-ink-faint text-sm`). Gradient orbs deleted.
- [ ] `home-layout.tsx`: remove `render.png` hero image and `ArkanaBackground`; hero becomes typographic (content itself restyled in Task 4). `main-layout.tsx`/`auth-layout.tsx`: plain `bg-surface-page` shells. If `arkana-background.tsx` ends up unreferenced, delete the file.
- [ ] `pnpm run build` + lint. Commit `restyle: editorial chrome (navbar, footer, layouts)`.

### Task 4: Home page

**Files:** Modify `src/features/home/**` (index + components incl. `hero-search.tsx`).

- [ ] Hero: eyebrow tagline (existing dict string), `display-title` headline, subline `text-ink-muted text-lg max-w-[45ch]`; one restrained `ArkanaPattern` field right-aligned/behind on `lg:`, hidden on mobile. Search = command bar: full-width `max-w-2xl`, outline input recipe with search icon, results panel `bg-surface-overlay border border-rule rounded-md` flat list, `<em>` hit highlight → `text-primary-800 not-italic`. Do not touch search logic (remove the leftover `console.log(hit)` only).
- [ ] Latest: section header = eyebrow label + hairline rule; first post as featured row (large `text-3xl md:text-4xl` title, meta line, `ArkanaStrip` band); rest = flat card grid `sm:grid-cols-2 lg:grid-cols-3` per card recipe (strip art, eyebrow tags, title `text-xl font-semibold`, `text-ink-faint text-sm` date/reading-time). Reading lists: editorial rows separated by hairline rules with quiet `→` CTA. Survey CTA: `border-y border-rule` banner, quiet CTA link.
- [ ] `pnpm run build` + lint. Commit `restyle: editorial home page`.

### Task 5: Shared content components

**Files:** Modify `src/components/ui/{post-card,featured-post-card,tag,pagination,empty-state}.tsx`, `src/components/{social-links,not-found-in-language,not-found-reading-list}.tsx`.

- [ ] PostCard/FeaturedPostCard: card + eyebrow + strip recipes (same as Task 4 grid cards — these are the actual components the grids render). Tag: badge chip recipe; selected state `border-primary-700 text-primary-800`. Pagination: minimal — `eyebrow`-style numbers, current `text-ink-heading border-b-2 border-primary-700`, prev/next as quiet arrows. EmptyState/not-found: centered, small `ArkanaPattern`, `text-ink-muted`, quiet CTA home link.
- [ ] `pnpm run build` + lint. Commit `restyle: shared cards, tags, pagination`.

### Task 6: Article page

**Files:** Modify `src/features/posts/**` (incl. `related-posts.tsx`), `src/components/ui/post-header.tsx`, `src/components/ui/post-content/index.tsx` (class changes only — component MAP untouched), `src/components/ui/{anchored-heading,paragraph,link,lists,blockquote,big-quote,figures,zoomable-image,video-embed,section-divider,latex-text,table-of-contents}.tsx`.

- [ ] Header: tag eyebrows row → `display-title` (scaled `clamp(2rem,4.5vw,3.25rem)`) → meta row (avatar 24px, author, date, reading time, `text-ink-muted text-sm`) framed `border-y border-rule py-4` → slim full-width `ArkanaStrip` band below.
- [ ] Body: reading column recipe on the content wrapper (keep `prose` classes; they're already overridden). AnchoredHeading: `tracking-tight text-ink-heading`, anchor `#` affordance `text-primary-800 opacity-0 group-hover:opacity-100`. Link: `text-primary-800 underline decoration-[1.5px] underline-offset-4 decoration-primary-800/40 hover:decoration-primary-800`. BigQuote: editorial pull quote — no box: `border-y border-rule py-8 my-12 text-2xl md:text-3xl leading-snug tracking-tight text-ink-heading`, small glyph mark above. SectionDivider: centered single glyph (`ArkanaPattern` at 24px) flanked by hairline rules. TOC: on `xl:` sticky right-margin rail — `eyebrow` "Contents" label, links `text-sm text-ink-muted hover:text-ink-heading`, active `text-primary-800 border-l-2 border-primary-700 pl-3`; below `xl:` keep current collapsible placement. Figures/zoomable/video: strip rounded corners to `rounded-md`, captions `text-ink-faint`.
- [ ] Post actions (`src/components/ui/post-actions/**`): minimal icon row `border-y border-rule`, icons `text-ink-muted hover:text-primary-800`, active states keep their current color logic. Comments (`ui/comments/**`): flat — hairline-separated list, avatar 28px, form uses input recipe + primary button. Buy-me-coffee (`ui/buy-me-coffee/**`): flat card recipe, primary/outline buttons; wallet flow logic untouched. RelatedPosts: hairline-ruled list rows, not cards.
- [ ] Verify an actual math+code+tables article renders (dev server, e.g. any cryptography-101 post) — KaTeX purple, Prism block, tables, callouts, zoom, anchors all fine.
- [ ] `pnpm run build` + lint. Commit `restyle: editorial article reading experience`.

### Task 7: Quiz

**Files:** Modify `src/components/ui/quiz/**` (index, components/*, alternatives/*).

- [ ] Container: flat card recipe with eyebrow "Quiz" header label. Options: `border border-rule rounded-[4px] px-4 py-3 hover:border-rule-strong cursor-pointer`; selected `border-primary-700 bg-primary-700/10`; result states keep EXACT `--correct`/`--incorrect` families: correct `border-correct bg-correct-50 text-correct-800`, incorrect `border-incorrect bg-incorrect-50 text-incorrect-800`. Submit: primary button. Result summary: big number + eyebrow label, no confetti-style decoration.
- [ ] Verify quiz interaction on a quiz-bearing article (QUIZ_EXAMPLE.md lists one). Build + lint. Commit `restyle: flat editorial quiz`.

### Task 8: Blog index, reading lists, writers, FAQ

**Files:** Modify `src/features/blog/list/**`, `src/features/reading-lists/{list,view,post}/**`, `src/features/writers/{list,view}/**`, `src/features/faq/**`.

- [ ] Every index page header: eyebrow section label + `display-title` (scaled to `text-4xl md:text-5xl`) + optional subline, hairline rule below. Blog list: tag filter chips (Tag recipe), rule-separated cards, minimal pagination. Reading lists: list = editorial rows (strip thumb, title, article count eyebrow, `→`); view = numbered progression WITH rationale (reading lists ARE sequences): index numeral `text-ink-faint tabular-nums`, hairline connectors; post view = article page style + prev/next as quiet arrow links framed by rules, remove `reading-list-render.png` if referenced. Writers: list = flat rows with avatar + bio excerpt; profile = editorial header (avatar 64px, name `display-title` scaled, social links) + their posts as rule-separated list. FAQ: accordion with hairline dividers, `+` rotating to `×`, question `text-ink-heading font-medium`, answer `text-ink-muted`.
- [ ] Build + lint. Commit `restyle: editorial index pages (blog, reading lists, writers, faq)`.

### Task 9: Auth pages

**Files:** Modify `src/features/auth/{login,signup}/**`, `src/components/layouts/auth-pattern-background.tsx`, `src/app/[lang]/auth/callback/auth-callback-client.tsx` (visual shell only).

- [ ] Keep canvas glyph `logo.tsx` as centerpiece. Single centered flat card (`max-w-sm`, card recipe, `bg-surface-raised`); provider buttons = outline recipe full-width with provider icons; hairline "or" separator; links quiet CTA. Pattern background: at most a faint glyph field `opacity-20` at the edges, or plain page. Callback: centered spinner + `text-ink-muted` message.
- [ ] Build + lint. Commit `restyle: editorial auth pages`.

### Task 10: Final verification sweep

- [ ] Grep sweep: no remaining hardcoded hex from the old list (`#e1dfe4|#b79cea|#c9b3f0|#8041f4|#37343d|#7f7e84|#f8f5ff|#36323d|#251444|#5423b0|#1b1a1b|#2a2837`) outside token definitions; no `shadow-` classes except intentional none; no references to `render.png|solo.png|reading-list-render.png|arkana-background`.
- [ ] `pnpm run build` (static export) + `pnpm run lint` → clean.
- [ ] Dev server visual pass, screenshot each: `/en`, `/en/blog`, math+code+table article, quiz article, `/en/reading-lists`, one reading list + one post in it, `/en/writers` + one writer, `/en/faq`, `/en/login`. Spot-check `/es` home. Confirm: TOC anchor offsets, search, language switcher, quiz flow, image zoom, mobile widths (375px) on home/article.
- [ ] Fix anything found; re-run build.
- [ ] Update `.claude/daily-update.md`; commit `restyle: final verification sweep and fixes`.
