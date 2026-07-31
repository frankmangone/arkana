# Generating social share images

`scripts/generate-social-image.js` builds a share-card PNG for a blog post: a
dense field of Arkana glyphs up top, and the post's title (plus an optional
link) on a dark panel below. It's a local CLI tool - nothing here is wired
into the build or the deploy pipeline.

## Usage

```bash
node scripts/generate-social-image.js <path-to-content-md-file> [--format=og|story] [--url]
```

`<path-to-content-md-file>` is a path into the sibling `arkana-content` repo's
`content/{lang}/{folder}/{slug}.md` structure. The script reads `title` from
that file's frontmatter and derives `lang`/`folder`/`slug` from the path
itself - it doesn't need any of those passed separately.

### Example

```bash
node scripts/generate-social-image.js \
  ../arkana-content/content/en/cryptography-101/where-to-start.md
```

```
Generating social image for "Cryptography 101: Where to Start"...
Wrote downloads/social/cryptography-101-where-to-start-en.png
```

## Flags

- `--format=og` (default) - 1200×630, the standard Open Graph / Twitter card
  size.
- `--format=story` - 1080×1920, for Instagram/Facebook Stories.
- `--url` - includes the post's canonical URL
  (`https://arkana.blog/{lang}/blog/{folder}/{slug}/`) at the bottom of the
  card. Omitted by default, since most of the time you'll add the link
  natively on the platform instead (a clickable link sticker on Stories, plain
  text in a LinkedIn post, etc.) rather than baking it into the image.

Passing `--url` changes the output filename (see below), so generating both
variants for the same post never overwrites one with the other.

## Output

Written to `downloads/social/` (gitignored, same as the rest of `downloads/`)
as `<folder>-<slug>-<lang>[-story][-link].png`. For example:

| Command | Output |
|---|---|
| *(no flags)* | `cryptography-101-where-to-start-en.png` |
| `--url` | `cryptography-101-where-to-start-en-link.png` |
| `--format=story` | `cryptography-101-where-to-start-en-story.png` |
| `--format=story --url` | `cryptography-101-where-to-start-en-story-link.png` |

## How it's built

- **Glyph field**: a server-side re-implementation of `glyph-rain.tsx`'s
  static frame - the same 16-segment Arkana glyph, randomly generated fresh
  on every run (no seed, so re-running the same post gives a different but
  same-style field each time). It's rendered as a standalone SVG (no canvas
  needed outside a browser) and tiles edge-to-edge with no gaps between
  glyphs, inset from the card's edges by a per-format margin.
- **Rendering**: the card is built as a [satori](https://github.com/vercel/satori)
  flexbox element tree - satori handles the title's text wrapping - then
  rasterized to PNG with `@resvg/resvg-js`.
- **Font**: Space Grotesk (the site's font) is fetched fresh from Google Fonts
  on every run, since neither this repo nor `arkana-content` vendors font
  files. This means **the script needs network access** to run.
- **Per-format tuning**: `FORMATS` in the script holds each format's
  dimensions, glyph size/margin, and type sizes. These aren't scaled from one
  format to the other by a fixed ratio - each was tuned against its own
  canvas and reviewed visually, since e.g. what wraps a title nicely at
  1200px wide doesn't at 1080px.

## Adding a new format

Add an entry to the `FORMATS` object in `scripts/generate-social-image.js`
with the new `width`/`height` and its own tuned type sizes - then generate a
few real posts (a short title and the longest one you can find) and look at
the output before committing to the numbers. Font sizes and glyph
`cellSize` genuinely don't scale linearly between formats; treat any new
format's numbers as a starting point to eyeball, not a formula.
