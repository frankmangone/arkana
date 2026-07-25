#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
const ADMIN_HMAC_SECRET = process.env.ADMIN_HMAC_SECRET;

if (!ADMIN_HMAC_SECRET) {
  console.error("Usage:\n  ADMIN_HMAC_SECRET=<secret> node scripts/pull-writers.js");
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

// Converts one backend WriterResponse (snake_case) into the frontend's
// Writer shape (camelCase, see src/lib/writers/types.ts). Uses the
// admin-authenticated /api/admin/writers, not the public /api/writers, so
// hidden writers are included too - a hidden writer can still be a
// published post's author, and the public API deliberately can't expose
// them.
function toWriterJson(raw) {
  const writer = {
    slug: raw.slug,
    name: raw.name,
    imageUrl: raw.image_url,
    avatarUrl: raw.avatar_url,
  };

  if (raw.organization) {
    writer.organization = {
      name: raw.organization.name,
      url: raw.organization.url,
    };
    if (raw.organization.logo_url) {
      writer.organization.logoUrl = raw.organization.logo_url;
    }
  }
  if (raw.bio) {
    writer.bio = raw.bio;
  }
  if (raw.social) {
    writer.social = raw.social;
  }
  if (raw.wallet_address) {
    writer.walletAddress = raw.wallet_address;
  }

  return writer;
}

async function main() {
  const { timestamp, signature } = signRequest(ADMIN_HMAC_SECRET);

  console.log(`Fetching writers from ${API_URL}/api/admin/writers...`);
  const response = await fetch(`${API_URL}/api/admin/writers`, {
    headers: {
      "X-Timestamp": timestamp,
      "X-Signature": signature,
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch writers: HTTP ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }

  const { data } = await response.json();
  if (!Array.isArray(data)) {
    console.error("Expected a data array in the /api/admin/writers response");
    process.exit(1);
  }

  const dataDir = path.join(__dirname, "..", "src", "data", "writers");
  fs.rmSync(dataDir, { recursive: true, force: true });
  fs.mkdirSync(dataDir, { recursive: true });

  for (const raw of data) {
    if (!raw.slug) {
      console.error(`Malformed writer, aborting: ${JSON.stringify(raw)}`);
      process.exit(1);
    }

    const destPath = path.join(dataDir, `${raw.slug}.json`);
    fs.writeFileSync(destPath, JSON.stringify(toWriterJson(raw), null, 2) + "\n");
    console.log(`Wrote ${path.relative(process.cwd(), destPath)}`);
  }

  console.log(`Pulled ${data.length} writer(s) from the API.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
