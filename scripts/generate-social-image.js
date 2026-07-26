#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

// Per-format canvas size and typography. Font sizes aren't a straight scale
// of the "og" values - they're tuned per format against its own width (what
// actually drives title wrapping) and reviewed visually, not derived.
const FORMATS = {
  og: {
    width: 1200,
    height: 630,
    glyphRatio: 0.6,
    cellSize: 64,
    glyphMargin: 40,
    paddingX: 56,
    gap: 22,
    logoSize: 34,
    wordmarkFontSize: 34,
    title: { threshold: 60, short: 48, long: 38 },
    urlFontSize: 20,
  },
  story: {
    width: 1080,
    height: 1920,
    glyphRatio: 0.6,
    cellSize: 140,
    glyphMargin: 56,
    paddingX: 72,
    gap: 36,
    logoSize: 48,
    wordmarkFontSize: 48,
    title: { threshold: 60, short: 64, long: 50 },
    urlFontSize: 26,
  },
};

const BG = "hsl(260, 30%, 8%)";
const INK_HEADING = "#f8f5ff";
const INK_MUTED = "#aca6bd";
const WORDMARK_COLOR = "hsl(260, 80%, 72%)";
const GLYPH_COLOR = "hsl(262, 65%, 60%)";

// Same 16-bit glyph geometry as arkana-frontend's glyph-rain.tsx, kept in
// sync deliberately - this is the site's actual recurring brand mark, not
// the diamond mosaic (that one's scoped to the coffee-tipping widget only).
const SEGMENTS = [
  [8, 0, 8, 4],
  [8, 16, 8, 12],
  [6, 6, 3, 3],
  [6, 10, 3, 13],
  [10, 6, 13, 3],
  [10, 10, 13, 13],
  [4, 8, 6, 6],
  [6, 6, 8, 4],
  [10, 6, 8, 4],
  [12, 8, 10, 6],
  [4, 8, 6, 10],
  [6, 10, 8, 12],
  [10, 10, 8, 12],
  [12, 8, 10, 10],
];

function randomBits() {
  return Math.floor(Math.random() * 0x10000);
}

function glyphPathD(x, y, cellW, cellH, bits) {
  const unitX = cellW / 16;
  const unitY = cellH / 16;
  const px = (gx) => x + gx * unitX;
  const py = (gy) => y + gy * unitY;

  const segs = [];
  segs.push([px(0), py(8), px(4), py(8)]);
  segs.push([px(16), py(8), px(12), py(8)]);

  SEGMENTS.forEach(([x1, y1, x2, y2], i) => {
    if (bits & (1 << i)) segs.push([px(x1), py(y1), px(x2), py(y2)]);
  });

  const d1 = bits & (1 << 14);
  const d2 = bits & (1 << 15);
  let diamond = null;
  if (d1 && d2) {
    diamond = `M${px(8)},${py(7)} L${px(7)},${py(8)} L${px(8)},${py(9)} L${px(9)},${py(8)} Z`;
  } else {
    if (!d1) segs.push([px(6), py(6), px(10), py(10)]);
    if (!d2) segs.push([px(10), py(6), px(6), py(10)]);
  }

  const linesD = segs.map(([x1, y1, x2, y2]) => `M${x1},${y1} L${x2},${y2}`).join(" ");
  return { linesD, diamond };
}

// A dense, seamlessly-tiled field of random glyphs (shape varies per glyph,
// color, opacity, or fading doesn't) filling the zone edge to edge, inset
// from the canvas by `margin`.
//
// `cellSize` is a target, not a hard pixel size: the actual cell width/height
// are fieldWidth/cols and fieldHeight/rows, with cols/rows rounded to the
// nearest whole count for that target. That's what guarantees the grid
// divides the inset field exactly - no leftover sliver of a column/row for a
// clip to cut a glyph in half at the far/bottom edge.
function buildGlyphFieldSvg(width, height, cellSize, margin) {
  const fieldWidth = width - margin * 2;
  const fieldHeight = height - margin * 2;
  const cols = Math.max(1, Math.round(fieldWidth / cellSize));
  const rows = Math.max(1, Math.round(fieldHeight / cellSize));
  const cellW = fieldWidth / cols;
  const cellH = fieldHeight / rows;

  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
  parts.push(`<rect width="${width}" height="${height}" fill="${BG}"/>`);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const { linesD, diamond } = glyphPathD(margin + c * cellW, margin + r * cellH, cellW, cellH, randomBits());
      const strokeWidth = Math.max(1, Math.min(cellW, cellH) / 36);

      parts.push(
        `<path d="${linesD}" stroke="${GLYPH_COLOR}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
      );
      if (diamond) {
        parts.push(`<path d="${diamond}" fill="${GLYPH_COLOR}"/>`);
      }
    }
  }

  parts.push("</svg>");
  return parts.join("");
}

function toDataUri(svgString) {
  return `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`;
}

// Old-browser User-Agent trick: Google Fonts serves plain TTF (rather than
// WOFF2) to browsers it thinks don't support modern formats. satori/opentype
// can't parse WOFF2, so this is the standard way to get a satori-compatible
// font file straight from the CSS2 API.
const LEGACY_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2";

async function fetchGoogleFont(family, weight) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`;
  const cssRes = await fetch(cssUrl, { headers: { "User-Agent": LEGACY_UA } });
  if (!cssRes.ok) {
    throw new Error(`Failed to fetch font CSS for ${family} ${weight}: HTTP ${cssRes.status}`);
  }
  const css = await cssRes.text();
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) throw new Error(`Could not find a font URL in Google Fonts CSS for ${family} ${weight}`);

  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`Failed to fetch font file for ${family} ${weight}: HTTP ${fontRes.status}`);
  return Buffer.from(await fontRes.arrayBuffer());
}

// content/{lang}/{folder}/{slug}.md -> { lang, folder, slug }
function parseContentPath(mdPath) {
  const abs = path.resolve(mdPath);
  const parts = abs.split(path.sep);
  const contentIdx = parts.lastIndexOf("content");
  if (contentIdx === -1 || parts.length < contentIdx + 4) {
    throw new Error(
      `Expected a path shaped like .../content/{lang}/{folder}/{slug}.md, got: ${mdPath}`
    );
  }
  const lang = parts[contentIdx + 1];
  const folder = parts[contentIdx + 2];
  const slug = path.basename(parts[contentIdx + 3], ".md");
  return { lang, folder, slug };
}

function buildTree({ format, title, url, glyphFieldDataUri, logoDataUri }) {
  const { width, height, glyphRatio, paddingX, gap, logoSize, wordmarkFontSize, title: t, urlFontSize } =
    format;
  const headerRow = {
    type: "div",
    props: {
      style: { display: "flex", alignItems: "center", gap: 10 },
      children: [
        { type: "img", props: { src: logoDataUri, width: logoSize, height: logoSize } },
        {
          type: "div",
          props: {
            style: { fontSize: wordmarkFontSize, fontWeight: 500, color: WORDMARK_COLOR },
            children: "arkana",
          },
        },
      ],
    },
  };
  const titleRow = {
    type: "div",
    props: {
      style: {
        display: "flex",
        fontSize: title.length > t.threshold ? t.long : t.short,
        fontWeight: 700,
        lineHeight: 1.15,
        color: INK_HEADING,
        letterSpacing: "-0.01em",
      },
      children: title,
    },
  };
  const urlRow = url
    ? {
        type: "div",
        props: {
          style: { display: "flex", fontSize: urlFontSize, color: INK_MUTED },
          children: url,
        },
      }
    : null;
  const glyphZoneHeight = Math.round(height * glyphRatio);
  const panelHeight = height - glyphZoneHeight;

  return {
    type: "div",
    props: {
      style: {
        width,
        height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: BG,
        fontFamily: "Space Grotesk",
      },
      children: [
        {
          type: "img",
          props: {
            src: glyphFieldDataUri,
            width,
            height: glyphZoneHeight,
            style: { width, height: glyphZoneHeight },
          },
        },
        {
          type: "div",
          props: {
            style: {
              width,
              height: panelHeight,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap,
                padding: `0 ${paddingX}px`,
            },
            children: [headerRow, titleRow, urlRow].filter(Boolean),
          },
        },
      ],
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const formatArg = args.find((a) => a.startsWith("--format="));
  const formatName = formatArg ? formatArg.split("=")[1] : "og";
  const includeUrl = args.includes("--url");
  const mdPath = args.find((a) => !a.startsWith("--"));

  const format = FORMATS[formatName];
  if (!mdPath || !format) {
    console.error(
      `Usage: node scripts/generate-social-image.js <path-to-content-md-file> [--format=${Object.keys(FORMATS).join("|")}] [--url]`
    );
    process.exit(1);
  }

  const { lang, folder, slug } = parseContentPath(mdPath);
  const raw = fs.readFileSync(path.resolve(mdPath), "utf8");
  const { data } = matter(raw);
  if (!data.title) {
    console.error(`No "title" found in frontmatter of ${mdPath}`);
    process.exit(1);
  }

  const url = includeUrl ? `https://arkana.blog/${lang}/blog/${folder}/${slug}/` : null;
  console.log(`Generating social image for "${data.title}"${url ? ` (${url})` : ""}...`);

  const [regular, bold] = await Promise.all([
    fetchGoogleFont("Space Grotesk", 400),
    fetchGoogleFont("Space Grotesk", 700),
  ]);

  const glyphZoneHeight = Math.round(format.height * format.glyphRatio);
  const glyphFieldDataUri = toDataUri(
    buildGlyphFieldSvg(format.width, glyphZoneHeight, format.cellSize, format.glyphMargin)
  );
  const logoSvgPath = path.join(__dirname, "..", "public", "logo.svg");
  const logoDataUri = toDataUri(fs.readFileSync(logoSvgPath, "utf8"));

  const tree = buildTree({ format, title: data.title, url, glyphFieldDataUri, logoDataUri });

  const { default: satori } = await import("satori");
  const { Resvg } = await import("@resvg/resvg-js");

  const svg = await satori(tree, {
    width: format.width,
    height: format.height,
    fonts: [
      { name: "Space Grotesk", data: regular, weight: 400, style: "normal" },
      { name: "Space Grotesk", data: bold, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();

  const outDir = path.join(__dirname, "..", "downloads", "social");
  fs.mkdirSync(outDir, { recursive: true });
  const formatSuffix = formatName === "og" ? "" : `-${formatName}`;
  const urlSuffix = includeUrl ? "-link" : "";
  const outPath = path.join(outDir, `${folder}-${slug}-${lang}${formatSuffix}${urlSuffix}.png`);
  fs.writeFileSync(outPath, png);

  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
