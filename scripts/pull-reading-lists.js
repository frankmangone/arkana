#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
const ADMIN_HMAC_SECRET = process.env.ADMIN_HMAC_SECRET;

if (!ADMIN_HMAC_SECRET) {
  console.error("Usage:\n  ADMIN_HMAC_SECRET=<secret> node scripts/pull-reading-lists.js");
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

// Converts one backend ReadingListResponse (snake_case, "slug" at every
// level) into today's on-disk reading-list shape ("id" at the list/module
// level, the item's post reference back under "slug") - see
// src/lib/reading-lists/data.ts's RawReadingList/RawModule/RawItem types,
// which this must match exactly since that file is not changing.
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
        slug: item.post_path,
        order: item.order,
      })),
    })),
  };

  if (raw.cover_image) {
    readingList.coverImage = raw.cover_image;
  }

  return readingList;
}

async function main() {
  const { timestamp, signature } = signRequest(ADMIN_HMAC_SECRET);

  console.log(`Fetching reading lists from ${API_URL}/api/admin/reading-lists...`);
  const response = await fetch(`${API_URL}/api/admin/reading-lists`, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": signature,
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch reading lists: HTTP ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }

  const { data } = await response.json();
  if (!Array.isArray(data)) {
    console.error("Expected a data array in the /api/admin/reading-lists response");
    process.exit(1);
  }

  const dataDir = path.join(__dirname, "..", "src", "data", "reading-lists");
  fs.rmSync(dataDir, { recursive: true, force: true });
  fs.mkdirSync(dataDir, { recursive: true });

  for (const raw of data) {
    if (!raw.slug) {
      console.error(`Malformed reading list, aborting: ${JSON.stringify(raw)}`);
      process.exit(1);
    }

    const destPath = path.join(dataDir, `${raw.slug}.json`);
    fs.writeFileSync(destPath, JSON.stringify(toReadingListJson(raw), null, 2) + "\n");
    console.log(`Wrote ${path.relative(process.cwd(), destPath)}`);
  }

  console.log(`Pulled ${data.length} reading list(s) from the API.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
