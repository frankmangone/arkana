#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

// EPHEMERAL — delete after running.
//
// One-shot: enables tag filtering + count-sorted facet search on the REMOTE
// Meilisearch indexes (posts_en/es/pt). The documents up there already carry
// their tags (publish-content.js always indexed them), so no re-indexing is
// needed — Meilisearch rebuilds facet data from existing documents when the
// settings land.
//
// Usage (same env vars as publish-content.js, DATABASE_PATH not needed):
//   REMOTE_HOST="root@96.30.205.129" MEILI_KEY="<master key>" \
//     node scripts/apply-tag-settings-remote.js

const { execFileSync } = require("child_process");

const LANGS = ["en", "es", "pt"];
const SETTINGS = JSON.stringify({
  filterableAttributes: ["tags"],
  faceting: { sortFacetValuesBy: { tags: "count" } },
});

function ssh(remoteHost, remoteCommand, input) {
  const options = { encoding: "utf8" };
  if (input !== undefined) options.input = input;
  return execFileSync("ssh", [remoteHost, remoteCommand], options);
}

function meiliGet(remoteHost, key, route) {
  return JSON.parse(
    ssh(
      remoteHost,
      `curl -s "http://localhost:7700${route}" -H "Authorization: Bearer ${key}"`
    )
  );
}

async function waitForTask(remoteHost, key, taskUid) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const task = meiliGet(remoteHost, key, `/tasks/${taskUid}`);
    if (task.status === "succeeded") return;
    if (task.status === "failed") {
      throw new Error(`Task ${taskUid} failed: ${JSON.stringify(task.error)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Task ${taskUid} did not complete in time`);
}

async function main() {
  const remoteHost = process.env.REMOTE_HOST;
  const key = process.env.MEILI_KEY;
  if (!remoteHost) throw new Error("Set REMOTE_HOST (SSH alias or user@host)");
  if (!key) throw new Error("Set MEILI_KEY (remote Meilisearch master key)");

  for (const lang of LANGS) {
    const indexUid = `posts_${lang}`;

    const index = meiliGet(remoteHost, key, `/indexes/${indexUid}`);
    if (index.code === "index_not_found") {
      console.log(`${indexUid}: index not found on remote, skipping`);
      continue;
    }

    console.log(`${indexUid}: applying settings...`);
    const patch = JSON.parse(
      ssh(
        remoteHost,
        `curl -s -X PATCH "http://localhost:7700/indexes/${indexUid}/settings" ` +
          `-H "Authorization: Bearer ${key}" -H "Content-Type: application/json" --data-binary @-`,
        SETTINGS
      )
    );
    if (typeof patch.taskUid !== "number") {
      throw new Error(`Settings update failed: ${JSON.stringify(patch)}`);
    }
    await waitForTask(remoteHost, key, patch.taskUid);

    const settings = meiliGet(remoteHost, key, `/indexes/${indexUid}/settings`);
    console.log(
      `${indexUid}: done — filterableAttributes=${JSON.stringify(
        settings.filterableAttributes
      )}, sortFacetValuesBy=${JSON.stringify(
        settings.faceting && settings.faceting.sortFacetValuesBy
      )}`
    );
  }

  console.log("\nAll done. You can now delete this script.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
