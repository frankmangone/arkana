#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const exportPath = process.argv[2];

if (!exportPath) {
  console.error("Usage: node pull-content.js <export.json>");
  process.exit(1);
}

let rows;
try {
  rows = JSON.parse(fs.readFileSync(exportPath, "utf8"));
} catch (error) {
  console.error(`Failed to read/parse ${exportPath}:`, error.message);
  process.exit(1);
}

if (!Array.isArray(rows)) {
  console.error("Expected a JSON array of rows from the post_content export");
  process.exit(1);
}

const contentRoot = path.join(__dirname, "..", "src", "content");

for (const row of rows) {
  const { lang, path: relPath, content } = row;

  if (!lang || !relPath || typeof content !== "string") {
    console.error(`Malformed row, aborting: ${JSON.stringify(row)}`);
    process.exit(1);
  }

  const destPath = path.join(contentRoot, lang, relPath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content);
  console.log(`Wrote ${path.relative(process.cwd(), destPath)}`);
}

console.log(`Pulled ${rows.length} post(s) from the database.`);
