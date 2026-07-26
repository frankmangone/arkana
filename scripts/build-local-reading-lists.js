#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "..", "..", "arkana-content", "reading-lists");

// Converts one arkana-content reading-lists/*.json file (camelCase, "slug"
// at every level) into today's on-disk reading-list shape ("id" at the
// list/module level, the item's post reference back under "slug") - see
// src/lib/reading-lists/data.ts's RawReadingList/RawModule/RawItem types,
// which this must match exactly since that file is not changing. This
// mirrors pull-reading-lists.js's toReadingListJson, just sourced from the
// local content repo instead of the backend API.
function toReadingListJson(raw) {
  const readingList = {
    id: raw.slug,
    ongoing: raw.ongoing,
    translations: raw.translations,
    modules: raw.modules.map((module) => ({
      id: module.slug,
      translations: module.translations,
      items: module.items.map((item) => ({
        id: item.slug,
        slug: item.postPath,
        order: item.order,
      })),
    })),
  };

  if (raw.coverImage) {
    readingList.coverImage = raw.coverImage;
  }

  return readingList;
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Content repo reading-lists directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".json"));

  const dataDir = path.join(__dirname, "..", "src", "data", "reading-lists");
  fs.rmSync(dataDir, { recursive: true, force: true });
  fs.mkdirSync(dataDir, { recursive: true });

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));

    if (!raw.slug) {
      console.error(`Malformed reading list, aborting: ${file}`);
      process.exit(1);
    }

    const destPath = path.join(dataDir, `${raw.slug}.json`);
    fs.writeFileSync(destPath, JSON.stringify(toReadingListJson(raw), null, 2) + "\n");
    console.log(`Wrote ${path.relative(process.cwd(), destPath)}`);
  }

  console.log(`Built ${files.length} reading list(s) from the local content repo.`);
}

main();
