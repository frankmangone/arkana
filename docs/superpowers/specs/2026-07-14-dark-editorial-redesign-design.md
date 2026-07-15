# Arkana "Dark Editorial" Redesign — Design Spec

Date: 2026-07-14
Status: Approved by Frank (conversation, 2026-07-14)

## Goal

Full visual redesign of arkana-frontend. Preserve all functionality, the existing
color choices (hue ramps), the logo assets, and the Space Grotesk fontface.
Everything else about the presentation may change. Reference aesthetic:
consensys.io blog — editorial calm, oversized type, generous whitespace, hairline
rules, flat surfaces, restrained accents — translated onto Arkana's forced-dark
purple canvas.

## Decisions (locked)

1. **Theme**: dark editorial. Forced dark mode stays; no light theme.
2. **Brand art**: keep the procedural canvas glyph system (`arkana-pattern`,
   `arkana-strip`, auth `logo.tsx`) as restrained accents; retire the 3D render
   images (`render.png`, `reading-list-render.png`, `solo.png`) from layouts.
3. **Execution**: token-led restyle in place. No parallel v2 component set, no
   presentation-layer rewrite. Restyle each component within its existing file.

## Design thesis

Typography does the heavy lifting; purple becomes punctuation instead of
wallpaper; the glyph system is the sole art direction. Separation via hairline
rules and surface steps, not shadows.

## 1. Foundation (`src/app/globals.css`)

- **Colors preserved**: every existing hue ramp stays exactly as-is — primary
  `hsl(260)` violet ramp, magenta secondary ramp, emerald / aquamarine / salmon /
  orange / bronze / sky ramps, quiz `--correct` (#43fae4) and `--incorrect`
  (#fa7b43) families.
- **New semantic layer** referencing those ramps:
  - `--surface-page`, `--surface-raised`, `--surface-overlay` (background steps)
  - `--ink-heading`, `--ink-body`, `--ink-muted`, `--ink-faint` (text steps)
  - `--rule` (hairline border: white ≈8% opacity), `--rule-strong`
  - `--accent` (maps to primary-700)
- **De-hardcode**: the ~30 raw hex values in globals.css (paragraph `#e1dfe4`,
  KaTeX purple `#b79cea`, inline code `#c9b3f0`, blockquote `#8041f4`/`#37343d`,
  table borders/zebra, callout palette, figcaption `#7f7e84`, `a.nav-bar`,
  `strong`) are re-expressed through the semantic tokens **at the same hues**.
- **Type scale**: display `clamp(2.5rem → 4.25rem)`, tight tracking/leading, for
  page titles; defined steps for h2/h3; body stays ~1.1rem with 1.8 line-height.
  New **eyebrow style**: 11–12px, uppercase, 0.1em letter-spacing, muted or
  accent color — used for categories, section labels, metadata everywhere.
- **Geometry**: `--radius` 0.625rem → ~0.375rem; shadows removed almost
  entirely. Buttons: solid squared primary; quiet text-links with `→` arrows as
  secondary CTAs.
- **Fonts**: Space Grotesk untouched (still `next/font` on body). Fix the dead
  `--font-sans`/`--font-mono` scaffold tokens (they reference undefined
  `--font-geist-*`) so `font-sans`/`font-mono` utilities resolve to Space
  Grotesk / a real mono stack.

## 2. Chrome

- **Navbar** (`src/components/layouts/navbar.tsx`): slim, sticky,
  backdrop-blurred, single hairline bottom rule. Logo + lowercase wordmark left;
  links in eyebrow style; minimal text language switcher; quiet outline auth
  button. Update `scroll-padding-top` / heading `scroll-margin-top` (currently
  100px) to match the new header height.
- **Footer** (`src/components/ui/footer.tsx`): gradient orbs retired. Hairline
  top rule, link columns, social row, thin glyph strip accent, small print.
- **Backgrounds**: full-page `arkana-background` procedural grid retired; one
  restrained glyph field on the home hero; small glyph accents elsewhere. 3D
  renders removed from `home-layout.tsx` and anywhere else they appear.

## 3. Pages

- **Home** (`features/home`): typographic hero — eyebrow tagline, display
  headline, subline; search restyled as wide hairline-bordered command bar.
  Featured latest article (large title + meta row), then flat rule-separated
  post-card grid (eyebrow tags, title, date/reading time, `arkana-strip` as card
  art). Reading lists as editorial rows; survey CTA as a ruled banner.
- **Article page** (`features/posts`, `ui/post-content/*`, `ui/post-header`):
  ~70ch reading column; oversized title with tag eyebrows and a hairline-framed
  metadata row (author, date, reading time); `arkana-strip` as slim header art
  band; sticky TOC in right margin on wide screens; `big-quote` as editorial
  pull quote; tables/callouts/blockquotes/code re-tokened flat; section dividers
  as centered glyph marks; post actions as minimal icon row; comments and
  buy-me-coffee restyled flat.
- **Blog index** (`features/blog/list`): tag filter as text-chip row,
  rule-separated flat cards, minimal pagination.
- **Reading lists / writers / FAQ**: eyebrow-labeled headers, hairline-ruled
  lists, flat accordion with plus icons.
- **Auth** (`features/auth`): keep canvas glyph logo; centered flat card with
  hairline border.
- **Quiz** (`ui/quiz/*`): `--correct`/`--incorrect` colors exactly preserved;
  options as flat hairline-bordered rows with clear selected/result states.

## 4. Non-goals / must not change

Hooks, services, API layer, i18n dictionary keys and wiring, the react-markdown
component map and `DivSwitch` routing, the content-hash pipeline
(`arkana-strip` `preCalculatedHash` prop + `scripts/calculate-hashes.js`),
wallet/auth flows, static-export config (`next.config.ts`), logo files
(`public/logo.svg` etc.), Space Grotesk.

## Iteration 2 (2026-07-14, after Frank's review)

Feedback: too much black, primary color underused, wants larger space
occupation and linear gradients (closer to Consensys's bold color blocks).

Changes, still on the same hue ramps:

- Base surfaces become purple-tinted (page `hsl(260 30% 8%)`, raised/overlay
  stepped up in the same hue); rules become purple-tinted instead of white.
- New gradient tokens: `--grad-brand` (vivid primary-500 → secondary-500,
  for buttons/accents), `--grad-band` (deep primary-100 → deep magenta, for
  hero/header panels), `--grad-fade` / `--grad-fade-up` (soft section washes).
- Primary buttons use the vivid brand gradient with white text.
- Home hero: taller, bigger display type, gradient wash background.
- Article + index pages: title headers sit on rounded deep-gradient panels.
- Reading-lists band, survey banner, footer: gradient surfaces.
- Quiz gets back a (subtle) gradient border as a nod to its old identity.

## 5. Verification

No tests exist in the repo; the safety net is:

- After each page group: `pnpm run build` (static export must pass) and
  `pnpm run lint`.
- Run the dev server and visually screenshot every route — home, blog index, an
  article featuring math + code + tables + quiz, reading lists, reading-list
  post, writer profile, FAQ, login — confirming rendering and that TOC anchors,
  search, language switching, quiz interaction, and post actions still behave.

## Iteration 3 (2026-07-14, second review)

Feedback: still too shy — wants the Consensys full-bleed saturated hero
(bright field, huge type, big space), especially on articles and landing.
Plus breadcrumbs.

- New `--grad-hero` (vivid primary 66%→58% → magenta 60%) with dark
  "ink-on-brand" text tokens — Arkana's answer to black-on-acid-green.
- Article hero: full-bleed vivid field with a Consensys-style left metadata
  rail (Date / Author / reading time), tag chips, clamp-to-4.75rem title,
  description, and the glyph fingerprint in dark ink.
- Landing hero: full-bleed vivid field, ~72vh, type up to 6rem.
- Index page headers (blog / reading lists / writers / FAQ / list view):
  same full-bleed vivid treatment.
- New `Breadcrumbs` component (root crumb = "arkana" wordmark) on all
  content pages; replaces the reading-list back button. New dictionary keys
  `blog.date` / `blog.author` in en/es/pt for the hero rail.
- `ArkanaStrip` gains an optional `lineColor` prop (default unchanged).

## Iteration 4 (2026-07-14, third review)

- Breadcrumbs live inside the hero fields in dark ink; the black gap between
  navbar and hero is gone everywhere (layout top padding removed, heroes
  flush under the navbar).
- Hero titles use `--ink-on-brand-title` (rich dark primary hsl(261 72% 26%))
  instead of near-black; small text stays darker for contrast.
- Post actions moved into the hero metadata rail, restyled as borderless
  lucide icons (Heart / MessageCircle): dark ink idle, salmon fill when liked.
- Buy-me-coffee widget: raised background, full padding, extends wider than
  the article column on lg (`-mx-20`).
- "Welcome to Arkana" eyebrow removed from the landing hero.
- New `GlyphRain` canvas component: matrix-style rain of Arkana glyphs down
  the right side of the landing hero (fade mask toward text, static field
  under prefers-reduced-motion).
- Search result thumbnails: flush to the row edge, 96px wide, full height.
