#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

async function main() {
  console.log(`Fetching tags from ${API_URL}/api/tags...`);

  const response = await fetch(`${API_URL}/api/tags`);

  if (!response.ok) {
    console.error(`Failed to fetch tags: HTTP ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }

  const body = await response.json();
  if (!Array.isArray(body.data)) {
    console.error("Expected a data array in the /api/tags response");
    process.exit(1);
  }

  const destPath = path.join(__dirname, "..", "src", "data", "tags.json");
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, JSON.stringify(body.data, null, 2) + "\n");

  console.log(`Wrote ${path.relative(process.cwd(), destPath)} (${body.data.length} tags).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
