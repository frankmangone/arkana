#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
const ADMIN_HMAC_SECRET = process.env.ADMIN_HMAC_SECRET;
const PAGE_LIMIT = 100;

if (!ADMIN_HMAC_SECRET) {
  console.error("Usage:\n  ADMIN_HMAC_SECRET=<secret> node scripts/pull-content.js");
  process.exit(1);
}

// Same scheme as the backend's adminauth middleware:
// signature = hex(HMAC-SHA256(secret, timestamp + "." + rawBody)).
// This is a GET request with no body, so rawBody is empty.
function signRequest(secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .digest("hex");
  return { timestamp, signature };
}

async function fetchPage(offset) {
  const { timestamp, signature } = signRequest(ADMIN_HMAC_SECRET);
  const url = `${API_URL}/api/admin/posts?limit=${PAGE_LIMIT}&offset=${offset}`;

  const response = await fetch(url, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": signature,
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch posts: HTTP ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }

  const body = await response.json();
  if (!Array.isArray(body.data) || typeof body.total !== "number") {
    console.error("Expected a data array and total count in the /api/admin/posts response");
    process.exit(1);
  }

  return body;
}

const contentRoot = path.join(__dirname, "..", "src", "content");

function writeRow(row) {
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

async function main() {
  console.log(`Fetching posts from ${API_URL}/api/admin/posts...`);

  let offset = 0;
  let pulled = 0;
  let total = Infinity;

  while (offset < total) {
    const page = await fetchPage(offset);
    total = page.total;

    for (const row of page.data) {
      writeRow(row);
      pulled++;
    }

    if (page.data.length === 0) break;
    offset += page.data.length;
  }

  console.log(`Pulled ${pulled} post(s) from the API.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
