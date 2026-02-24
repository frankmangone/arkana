import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const MEDIUM_DRAFT_ENDPOINT = "https://medium.com/new-story";
const MEDIUM_UPLOAD_ENDPOINT =
  process.env.MEDIUM_UPLOAD_ENDPOINT || "https://medium.com/_/upload";
const MEDIUM_UPLOAD_FIELD = process.env.MEDIUM_UPLOAD_FIELD || "image";
const MEDIUM_IMAGE_PARAGRAPH_TYPE = Number(
  process.env.MEDIUM_IMAGE_PARAGRAPH_TYPE || "4"
);

interface CliOptions {
  markdownFile?: string;
  title?: string;
  visibility: number;
  coverless: boolean;
  dryRun: boolean;
}

interface MediumDraftResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface MediumParagraph {
  name: string;
  type: number;
  text: string;
  markups: unknown[];
  metadata?: Record<string, unknown>;
}

interface MediumDelta {
  type: 3;
  index: number;
  paragraph: MediumParagraph;
}

interface FigureBlock {
  kind: "figure";
  rawHtml: string;
  src: string;
  alt?: string;
  title?: string;
}

interface LatexBlock {
  kind: "latex_block";
  latex: string;
}

interface TextBlock {
  kind: "text";
  content: string;
}

type ContentBlock = FigureBlock | LatexBlock | TextBlock;

interface AuthContext {
  cookie: string;
  xsrfToken: string;
}

interface ResolvedImage {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
}

function printUsage(): void {
  console.log(`\nUsage:
  npm run post:medium -- --file <markdown-file> [options]

Options:
  -f, --file <path>           Markdown file to post
  -t, --title <title>         Override title (defaults to markdown frontmatter/title)
  -v, --visibility <value>    draft|unlisted|public|0|1|2 (default: draft)
      --coverless             Create draft without cover (default)
      --with-cover            Create draft with cover
      --dry-run               Print request payload and skip API call
  -h, --help                  Show this help

Environment:
  MEDIUM_COOKIE               Full Medium cookie string
  MEDIUM_XSRF_TOKEN           XSRF token from cookie/session
  MEDIUM_UPLOAD_ENDPOINT      Optional upload endpoint override
  MEDIUM_UPLOAD_FIELD         Optional multipart field name (default: image)
  MEDIUM_IMAGE_PARAGRAPH_TYPE Optional image paragraph type (default: 4)
`);
}

function parseVisibility(value?: string): number {
  if (!value || value === "draft") {
    return 0;
  }

  if (value === "unlisted") {
    return 1;
  }

  if (value === "public") {
    return 2;
  }

  const numericValue = Number(value);
  if ([0, 1, 2].includes(numericValue)) {
    return numericValue;
  }

  throw new Error(`Invalid visibility value: ${value}`);
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    visibility: 0,
    coverless: true,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    }

    if (arg === "-f" || arg === "--file") {
      options.markdownFile = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "-t" || arg === "--title") {
      options.title = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "-v" || arg === "--visibility") {
      options.visibility = parseVisibility(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--coverless") {
      options.coverless = true;
      continue;
    }

    if (arg === "--with-cover") {
      options.coverless = false;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (!options.markdownFile) {
    throw new Error("Missing required option: --file <markdown-file>");
  }

  return options;
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) {
    return markdown;
  }

  const frontmatterEnd = markdown.indexOf("\n---", 3);
  if (frontmatterEnd === -1) {
    return markdown;
  }

  return markdown.slice(frontmatterEnd + 4).trimStart();
}

function extractTitle(markdown: string): string | undefined {
  const frontmatterTitleMatch = markdown.match(/^title:\s*['\"]?(.+?)['\"]?$/m);
  if (frontmatterTitleMatch?.[1]) {
    return frontmatterTitleMatch[1].trim();
  }

  const firstHeadingMatch = markdown.match(/^#\s+(.+)$/m);
  if (firstHeadingMatch?.[1]) {
    return firstHeadingMatch[1].trim();
  }

  return undefined;
}

function normalizeMarkdownContent(markdown: string): string {
  const withInlineLatex = replaceInlineLatex(markdown);

  return withInlineLatex
    .replace(/```[\s\S]*?```/g, (block) => {
      const cleanedBlock = block
        .replace(/```[a-zA-Z0-9_-]*\n?/, "")
        .replace(/```$/, "")
        .trim();

      if (!cleanedBlock) {
        return "";
      }

      return cleanedBlock
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n");
    })
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, "• ");
}

const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  i: "ⁱ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  n: "ⁿ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  x: "ˣ",
  y: "ʸ",
  z: "ᶻ",
};

const GREEK_MAP: Record<string, string> = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ε",
  "\\zeta": "ζ",
  "\\eta": "η",
  "\\theta": "θ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\xi": "ξ",
  "\\pi": "π",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\tau": "τ",
  "\\upsilon": "υ",
  "\\phi": "φ",
  "\\chi": "χ",
  "\\psi": "ψ",
  "\\omega": "ω",
  "\\Gamma": "Γ",
  "\\Delta": "Δ",
  "\\Theta": "Θ",
  "\\Lambda": "Λ",
  "\\Xi": "Ξ",
  "\\Pi": "Π",
  "\\Sigma": "Σ",
  "\\Phi": "Φ",
  "\\Psi": "Ψ",
  "\\Omega": "Ω",
};

function mapScriptCharacters(value: string, map: Record<string, string>): string | null {
  let converted = "";
  for (const char of value) {
    const mappedChar = map[char];
    if (!mappedChar) {
      return null;
    }
    converted += mappedChar;
  }
  return converted;
}

function replaceScriptNotations(
  input: string,
  marker: "_" | "^",
  map: Record<string, string>
): string | null {
  const braced = new RegExp(`\\${marker}\\{([^{}]+)\\}`, "g");
  const single = new RegExp(`\\${marker}([A-Za-z0-9()+\\-=])`, "g");

  let failed = false;
  let output = input.replace(braced, (_match, content: string) => {
    const converted = mapScriptCharacters(content, map);
    if (!converted) {
      failed = true;
      return _match;
    }
    return converted;
  });

  output = output.replace(single, (_match, content: string) => {
    const converted = mapScriptCharacters(content, map);
    if (!converted) {
      failed = true;
      return _match;
    }
    return converted;
  });

  if (failed) {
    return null;
  }

  return output;
}

function latexToUnicodeIfPossible(expression: string): string | null {
  let candidate = expression.trim();

  candidate = candidate.replace(
    /\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g,
    (_match, numerator: string, denominator: string) =>
      `${numerator.trim()} / ${denominator.trim()}`
  );

  for (const [latexToken, unicodeValue] of Object.entries(GREEK_MAP)) {
    candidate = candidate.replace(new RegExp(latexToken.replace("\\", "\\\\"), "g"), unicodeValue);
  }

  const withSubscripts = replaceScriptNotations(candidate, "_", SUBSCRIPT_MAP);
  if (!withSubscripts) {
    return null;
  }

  const withSuperscripts = replaceScriptNotations(
    withSubscripts,
    "^",
    SUPERSCRIPT_MAP
  );
  if (!withSuperscripts) {
    return null;
  }

  candidate = withSuperscripts
    .replace(/[{}]/g, "")
    .replace(/\\cdot/g, "·")
    .replace(/\\times/g, "×")
    .replace(/\\pm/g, "±")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\s+/g, " ")
    .trim();

  if (candidate.includes("\\") || candidate.includes("_") || candidate.includes("^")) {
    return null;
  }

  return candidate;
}

function replaceInlineLatex(text: string): string {
  return text.replace(/\$(?!\$)([^$\n]+?)\$/g, (_match, expression: string) => {
    const unicodeVersion = latexToUnicodeIfPossible(expression);
    if (unicodeVersion) {
      return unicodeVersion;
    }
    return expression.trim();
  });
}

function splitIntoParagraphs(markdown: string): string[] {
  const normalized = normalizeMarkdownContent(markdown);

  return normalized
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s+\n/g, "\n").trim())
    .filter((paragraph) => paragraph.length > 0);
}

function createParagraphName(index: number): string {
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  return `${index.toString(16).padStart(2, "0")}${randomSuffix}`;
}

function parseFigureBlock(rawHtml: string): FigureBlock | null {
  const $ = cheerio.load(rawHtml);
  const image = $("img").first();

  const src = image.attr("src")?.trim();
  if (!src) {
    return null;
  }

  const figCaptionText = $("figcaption").first().text().trim();
  const title = image.attr("title")?.trim() || figCaptionText || undefined;
  const alt = image.attr("alt")?.trim() || undefined;

  return {
    kind: "figure",
    rawHtml,
    src,
    alt,
    title,
  };
}

function parseLatexBlock(rawBlock: string): LatexBlock | null {
  const latex = rawBlock
    .replace(/^\s*\$\$\s*\n?/, "")
    .replace(/\n?\s*\$\$\s*$/, "")
    .trim();

  if (!latex) {
    return null;
  }

  return {
    kind: "latex_block",
    latex,
  };
}

function parseContentBlocks(markdownBody: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const tokenRegex =
    /<figure\b[^>]*>[\s\S]*?<\/figure>|(?:^|\n)\s*\$\$\s*\n[\s\S]*?\n\s*\$\$\s*(?=\n|$)/g;

  let cursor = 0;
  let match: RegExpExecArray | null = tokenRegex.exec(markdownBody);

  while (match) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    const precedingText = markdownBody.slice(cursor, matchStart).trim();
    if (precedingText) {
      blocks.push({
        kind: "text",
        content: precedingText,
      });
    }

    const token = match[0];

    if (token.includes("<figure")) {
      const parsedFigure = parseFigureBlock(token);
      if (parsedFigure) {
        blocks.push(parsedFigure);
      } else {
        blocks.push({
          kind: "text",
          content: token,
        });
      }
    } else {
      const parsedLatex = parseLatexBlock(token);
      if (parsedLatex) {
        blocks.push(parsedLatex);
      } else {
        blocks.push({
          kind: "text",
          content: token,
        });
      }
    }

    cursor = matchEnd;
    match = tokenRegex.exec(markdownBody);
  }

  const trailingText = markdownBody.slice(cursor).trim();
  if (trailingText) {
    blocks.push({
      kind: "text",
      content: trailingText,
    });
  }

  return blocks;
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function renderLatexBlockImage(latexExpression: string): Promise<ResolvedImage> {
  const rawLines = latexExpression
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const lines = rawLines.length > 0 ? rawLines : [latexExpression.trim()];

  const maxLineLength = Math.max(...lines.map((line) => line.length), 1);
  const width = Math.max(240, Math.min(2400, maxLineLength * 14 + 80));
  const lineHeight = 38;
  const height = Math.max(100, lines.length * lineHeight + 60);

  const tspanLines = lines
    .map((line, lineIndex) => {
      const dy = lineIndex === 0 ? 0 : lineHeight;
      return `<tspan x="40" dy="${dy}">${escapeXmlText(line)}</tspan>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
  <text x="40" y="56" font-family="Times New Roman, serif" font-size="32" fill="#000000">${tspanLines}</text>
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  const safeName = latexExpression
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 40);
  const fallbackName = safeName || `latex-${Date.now()}`;

  return {
    bytes: pngBuffer,
    fileName: `${fallbackName}.png`,
    mimeType: "image/png",
  };
}

function guessMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function getFileNameFromSource(src: string): string {
  try {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      const parsedUrl = new URL(src);
      const fileName = path.basename(parsedUrl.pathname);
      if (fileName) {
        return fileName;
      }
    }
  } catch {
    // Fallback below
  }

  const rawFileName = path.basename(src);
  if (rawFileName && rawFileName !== "/" && rawFileName !== ".") {
    return rawFileName;
  }

  return `image-${Date.now()}.jpg`;
}

async function canAccessFile(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveLocalImagePath(
  source: string,
  markdownPath: string
): Promise<string> {
  if (path.isAbsolute(source)) {
    const existsAbsolute = await canAccessFile(source);
    if (existsAbsolute) {
      return source;
    }

    const publicFallback = path.resolve(process.cwd(), "public", source.replace(/^\//, ""));
    const existsPublic = await canAccessFile(publicFallback);
    if (existsPublic) {
      return publicFallback;
    }

    throw new Error(`Absolute image source not found: ${source}`);
  }

  const markdownDirectory = path.dirname(markdownPath);
  const localRelativePath = path.resolve(markdownDirectory, source);
  const existsRelative = await canAccessFile(localRelativePath);
  if (existsRelative) {
    return localRelativePath;
  }

  const publicFallback = path.resolve(process.cwd(), "public", source.replace(/^\//, ""));
  const existsPublic = await canAccessFile(publicFallback);
  if (existsPublic) {
    return publicFallback;
  }

  throw new Error(`Local image source not found: ${source}`);
}

async function resolveFigureImage(
  figure: FigureBlock,
  markdownPath: string
): Promise<ResolvedImage> {
  const source = figure.src.trim();
  const fileName = getFileNameFromSource(source);

  if (source.startsWith("http://") || source.startsWith("https://")) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(
        `Failed to download remote image (${response.status}): ${source}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const mimeType = response.headers.get("content-type") || guessMimeType(fileName);

    return {
      bytes: new Uint8Array(arrayBuffer),
      fileName,
      mimeType,
    };
  }

  const localPath = await resolveLocalImagePath(source, markdownPath);
  const bytes = await fs.readFile(localPath);

  return {
    bytes,
    fileName: path.basename(localPath),
    mimeType: guessMimeType(localPath),
  };
}

function buildJsonHeaders(auth: AuthContext): Record<string, string> {
  return {
    Cookie: auth.cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Content-Type": "application/json",
    Accept: "application/json",
    Referer: "https://medium.com/new-story",
    Origin: "https://medium.com",
    "X-Obvious-Csrf": auth.xsrfToken,
    "X-Xsrf-Token": auth.xsrfToken,
    "X-Requested-With": "XMLHttpRequest",
  };
}

function buildMultipartHeaders(auth: AuthContext): Record<string, string> {
  return {
    Cookie: auth.cookie,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    Referer: "https://medium.com/new-story",
    Origin: "https://medium.com",
    "X-Obvious-Csrf": auth.xsrfToken,
    "X-Xsrf-Token": auth.xsrfToken,
    "X-Requested-With": "XMLHttpRequest",
  };
}

function parsePossiblyPrefixedJson(rawData: string): unknown {
  const sanitized = rawData.replace(/^\)\]\}'\s*/, "");

  try {
    return JSON.parse(sanitized);
  } catch {
    return rawData;
  }
}

function collectUrls(value: unknown, collector: string[]): void {
  if (typeof value === "string") {
    const matches = value.match(/https?:\/\/[^\s"'<>]+/g) || [];
    collector.push(...matches);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectUrls(item, collector));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((nestedValue) => collectUrls(nestedValue, collector));
  }
}

function pickLikelyImageUrl(payload: unknown): string | null {
  const urls: string[] = [];
  collectUrls(payload, urls);

  const prioritized = urls.find((url) =>
    /miro\.medium\.com|cdn-images|\.jpg|\.jpeg|\.png|\.webp|\.gif/i.test(url)
  );

  return prioritized || urls[0] || null;
}

async function uploadImageToMedium(
  image: ResolvedImage,
  auth: AuthContext
): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([image.bytes], { type: image.mimeType });

  formData.append(MEDIUM_UPLOAD_FIELD, blob, image.fileName);

  const response = await fetch(MEDIUM_UPLOAD_ENDPOINT, {
    method: "POST",
    headers: buildMultipartHeaders(auth),
    body: formData,
  });

  const rawResponse = await response.text();
  const parsedResponse = parsePossiblyPrefixedJson(rawResponse);

  if (!response.ok) {
    throw new Error(
      `Medium upload failed (${response.status}): ${rawResponse.slice(0, 300)}`
    );
  }

  const uploadedUrl = pickLikelyImageUrl(parsedResponse);
  if (!uploadedUrl) {
    throw new Error(`Could not extract uploaded image URL from Medium response`);
  }

  return uploadedUrl;
}

function createTextDelta(index: number, text: string): MediumDelta {
  return {
    type: 3,
    index,
    paragraph: {
      name: createParagraphName(index),
      type: 1,
      text,
      markups: [],
    },
  };
}

function createImageDelta(index: number, imageUrl: string): MediumDelta {
  return {
    type: 3,
    index,
    paragraph: {
      name: createParagraphName(index),
      type: MEDIUM_IMAGE_PARAGRAPH_TYPE,
      text: imageUrl,
      markups: [],
      metadata: {
        id: imageUrl,
        href: imageUrl,
        src: imageUrl,
      },
    },
  };
}

async function markdownToDeltas(options: {
  markdown: string;
  title?: string;
  markdownPath: string;
  dryRun: boolean;
  auth?: AuthContext;
}): Promise<MediumDelta[]> {
  const { markdown, title, markdownPath, dryRun, auth } = options;

  const markdownBody = stripFrontmatter(markdown);
  const contentBlocks = parseContentBlocks(markdownBody);

  const deltas: MediumDelta[] = [];
  let currentIndex = 0;

  if (title) {
    deltas.push(createTextDelta(currentIndex, title));
    currentIndex += 1;
  }

  for (const block of contentBlocks) {
    if (block.kind === "text") {
      const paragraphs = splitIntoParagraphs(block.content);
      for (const paragraph of paragraphs) {
        deltas.push(createTextDelta(currentIndex, paragraph));
        currentIndex += 1;
      }
      continue;
    }

    let imageUrl = "";

    if (block.kind === "figure") {
      imageUrl = block.src;

      if (dryRun) {
        imageUrl = `dry-run://uploaded/${getFileNameFromSource(block.src)}`;
      } else {
        if (!auth) {
          throw new Error("Authentication context is required for image upload");
        }

        const resolvedImage = await resolveFigureImage(block, markdownPath);
        imageUrl = await uploadImageToMedium(resolvedImage, auth);
      }

      deltas.push(createImageDelta(currentIndex, imageUrl));
      currentIndex += 1;

      const caption = block.title || block.alt;
      if (caption) {
        deltas.push(createTextDelta(currentIndex, caption));
        currentIndex += 1;
      }
      continue;
    }

    if (dryRun) {
      imageUrl = `dry-run://uploaded/latex-${currentIndex}.png`;
    } else {
      if (!auth) {
        throw new Error("Authentication context is required for image upload");
      }

      const resolvedImage = await renderLatexBlockImage(block.latex);
      imageUrl = await uploadImageToMedium(resolvedImage, auth);
    }

    deltas.push(createImageDelta(currentIndex, imageUrl));
    currentIndex += 1;
  }

  return deltas;
}

function parseMediumResponse(rawData: unknown): unknown {
  if (typeof rawData !== "string") {
    return rawData;
  }

  return parsePossiblyPrefixedJson(rawData);
}

async function createDraft(options: {
  deltas: MediumDelta[];
  visibility: number;
  coverless: boolean;
  auth: AuthContext;
}): Promise<MediumDraftResponse> {
  const { deltas, visibility, coverless, auth } = options;

  try {
    const logLockId = Math.floor(Math.random() * 100000);
    const payload = {
      baseRev: -1,
      coverless,
      deltas,
      visibility,
    };

    const response = await axios.post(
      `${MEDIUM_DRAFT_ENDPOINT}?logLockId=${logLockId}`,
      payload,
      {
        headers: buildJsonHeaders(auth),
        timeout: 20000,
      }
    );

    return {
      success: true,
      data: parseMediumResponse(response.data),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `HTTP ${error.response?.status}: ${error.response?.statusText}`,
      };
    }

    return {
      success: false,
      error: String(error),
    };
  }
}

function getAuthContextFromEnv(): AuthContext {
  const cookie = process.env.MEDIUM_COOKIE;
  const xsrfToken = process.env.MEDIUM_XSRF_TOKEN;

  if (!cookie || !xsrfToken) {
    throw new Error(
      "Missing MEDIUM_COOKIE or MEDIUM_XSRF_TOKEN environment variables"
    );
  }

  return {
    cookie,
    xsrfToken,
  };
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  const markdownPath = path.resolve(options.markdownFile as string);
  const markdownContent = await fs.readFile(markdownPath, "utf-8");

  const resolvedTitle = options.title || extractTitle(markdownContent);

  const auth = options.dryRun ? undefined : getAuthContextFromEnv();

  const deltas = await markdownToDeltas({
    markdown: markdownContent,
    title: resolvedTitle,
    markdownPath,
    dryRun: options.dryRun,
    auth,
  });

  if (deltas.length === 0) {
    throw new Error("No content could be extracted from markdown file");
  }

  if (options.dryRun) {
    console.log("🧪 Dry run enabled. Payload preview:");
    const imageDeltas = deltas.filter(
      (delta) => delta.paragraph.type === MEDIUM_IMAGE_PARAGRAPH_TYPE
    );

    console.log(
      JSON.stringify(
        {
          baseRev: -1,
          coverless: options.coverless,
          visibility: options.visibility,
          deltaCount: deltas.length,
          imageDeltaCount: imageDeltas.length,
          firstDelta: deltas[0],
          firstImageDelta: imageDeltas[0] || null,
        },
        null,
        2
      )
    );
    return;
  }

  const result = await createDraft({
    deltas,
    visibility: options.visibility,
    coverless: options.coverless,
    auth: auth as AuthContext,
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to create Medium draft");
  }

  console.log("✅ Draft creation request completed.");
  console.log(JSON.stringify(result.data, null, 2));
}

if (require.main === module) {
  run().catch((error) => {
    console.error("❌", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

export {
  createDraft,
  extractTitle,
  markdownToDeltas,
  parseArgs,
  parseContentBlocks,
  splitIntoParagraphs,
};
