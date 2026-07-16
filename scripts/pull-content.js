#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const exportPath = process.argv[2];

// content is CAST to TEXT because publish-content.js inserts it via
// readfile(), which stores a BLOB; sqlite3 -json won't emit blobs as plain
// strings. The cast is lossless for our UTF-8 markdown.
const EXPORT_QUERY =
  "SELECT lang, path, CAST(content AS TEXT) AS content FROM post_contents;";

function fetchRowsOverSsh() {
  const remoteHost = process.env.REMOTE_HOST;
  const databasePath = process.env.DATABASE_PATH;

  if (!remoteHost || !databasePath) {
    console.error(
      "Usage:\n" +
        "  node pull-content.js <export.json>\n" +
        "  REMOTE_HOST=<user@host> DATABASE_PATH=</path/to/blog.db> node pull-content.js"
    );
    process.exit(1);
  }

  if (!/^[a-zA-Z0-9_\-./]+$/.test(databasePath)) {
    console.error(`Invalid DATABASE_PATH: "${databasePath}"`);
    process.exit(1);
  }

  console.log(`Exporting post_contents from ${remoteHost}:${databasePath}...`);
  const json = execFileSync(
    "ssh",
    [remoteHost, `sqlite3 -json "${databasePath}" "${EXPORT_QUERY}"`],
    { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 }
  );

  // sqlite3 -json prints nothing at all for an empty result set
  return json.trim() ? JSON.parse(json) : [];
}

let rows;
if (exportPath) {
  try {
    rows = JSON.parse(fs.readFileSync(exportPath, "utf8"));
  } catch (error) {
    console.error(`Failed to read/parse ${exportPath}:`, error.message);
    process.exit(1);
  }
} else {
  rows = fetchRowsOverSsh();
}

if (!Array.isArray(rows)) {
  console.error("Expected a JSON array of rows from the post_contents export");
  process.exit(1);
}

const contentRoot = path.join(__dirname, "..", "src", "content");
fs.mkdirSync(contentRoot, { recursive: true });

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
