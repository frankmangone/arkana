#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// A ref is "/images/..." preceded by start-of-line, whitespace or one of " ' ( = :
// (so https://host/images/x.png is not matched) and ended by whitespace or " ' ) ] >.
const IMAGE_REF = /(?:^|[\s"'(=:])(\/images\/[^\s"')\]>]+)/gm;
const SCANNED_EXTENSIONS = new Set([".md", ".json"]);
const IMAGES_PREFIX = "/images/";

function decode(ref) {
  try {
    return decodeURI(ref);
  } catch {
    return ref;
  }
}

function extractImageRefs(text) {
  const refs = new Set();
  for (const match of text.matchAll(IMAGE_REF)) {
    refs.add(decode(match[1].split(/[?#]/)[0]));
  }
  return [...refs];
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return SCANNED_EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
  });
}

function findMissingRefs({ scanRoots, imagesRoot }) {
  const files = scanRoots.flatMap(listFiles);
  const missing = [];
  for (const file of files) {
    for (const ref of extractImageRefs(fs.readFileSync(file, "utf8"))) {
      const onDisk = path.join(imagesRoot, ref.slice(IMAGES_PREFIX.length));
      if (!fs.existsSync(onDisk)) missing.push({ file, ref });
    }
  }
  return { scanned: files.length, missing };
}

function main() {
  const root = path.join(__dirname, "..");
  const { scanned, missing } = findMissingRefs({
    scanRoots: ["content", "writers", "reading-lists"].map((dir) =>
      path.join(root, "src", "data", dir)
    ),
    imagesRoot: path.join(root, "public", "images"),
  });

  if (scanned === 0) {
    console.error(
      "No content files found under src/data - refusing to report success."
    );
    process.exit(1);
  }
  if (missing.length === 0) {
    console.log(`All /images references resolve (${scanned} files scanned).`);
    return;
  }
  console.error(
    `${missing.length} image reference(s) have no file under public/images:`
  );
  for (const { file, ref } of missing) {
    console.error(`  ${path.relative(root, file)} -> ${ref}`);
  }
  process.exit(1);
}

if (require.main === module) main();

module.exports = { extractImageRefs, findMissingRefs };
