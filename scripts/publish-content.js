#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { Command } = require("commander");
const matter = require("gray-matter");
const { stripMarkdown } = require("./indexing/utils/strip-markdown");

// Restricts values embedded directly into the remote SQL string (below) to a
// safe character set, so no quote-escaping is needed and injection isn't possible.
const SAFE_PATTERN = /^[a-zA-Z0-9_\-./*]+$/;

function assertSafe(value, label) {
  if (!SAFE_PATTERN.test(value)) {
    throw new Error(
      `Invalid ${label}: "${value}" (only letters, numbers, "_", "-", ".", "/" allowed)`
    );
  }
}

function ssh(remoteHost, remoteCommand, input) {
  const options = { encoding: "utf8" };
  if (input !== undefined) options.input = input;
  return execFileSync("ssh", [remoteHost, remoteCommand], options);
}

// Ensures the index supports tag filtering and facet search (used by the
// backend's /api/search?tags= and /api/search/tags). Idempotent - PATCHing
// the same values is a cheap no-op task - and Meilisearch queues tasks per
// index, so the document write below is guaranteed to land after it.
function ensureTagSettings(remoteHost, masterKey, indexUid) {
  const response = JSON.parse(
    ssh(
      remoteHost,
      `curl -s -X PATCH "http://localhost:7700/indexes/${indexUid}/settings" ` +
        `-H "Authorization: Bearer ${masterKey}" -H "Content-Type: application/json" --data-binary @-`,
      JSON.stringify({
        filterableAttributes: ["tags"],
        faceting: { sortFacetValuesBy: { tags: "count" } },
      })
    )
  );

  if (typeof response.taskUid !== "number") {
    throw new Error(`Meilisearch settings update failed: ${JSON.stringify(response)}`);
  }
}

// Runs on the remote host itself (curl against its own localhost:7700) so no
// tunnel from the operator's machine is ever required - same reasoning as
// why the DB writes above go over SSH instead of a direct DB connection.
// The document (arbitrary post content: quotes, backticks, LaTeX, etc.) is
// piped over stdin via --data-binary @-, never embedded in the command
// string, so it can't break out of the remote shell command.
async function indexIntoMeilisearch(remoteHost, masterKey, indexUid, document) {
  const addResponse = JSON.parse(
    ssh(
      remoteHost,
      `curl -s -X POST "http://localhost:7700/indexes/${indexUid}/documents?primaryKey=id" ` +
        `-H "Authorization: Bearer ${masterKey}" -H "Content-Type: application/json" --data-binary @-`,
      JSON.stringify([document])
    )
  );

  if (typeof addResponse.taskUid !== "number") {
    throw new Error(`Meilisearch indexing failed: ${JSON.stringify(addResponse)}`);
  }

  const taskCommand =
    `curl -s "http://localhost:7700/tasks/${addResponse.taskUid}" ` +
    `-H "Authorization: Bearer ${masterKey}"`;

  for (let attempt = 0; attempt < 20; attempt++) {
    const task = JSON.parse(ssh(remoteHost, taskCommand));
    if (task.status === "succeeded") return task;
    if (task.status === "failed") {
      throw new Error(`Meilisearch indexing task failed: ${JSON.stringify(task.error)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Meilisearch indexing task ${addResponse.taskUid} did not complete in time`);
}

async function main() {
  const program = new Command();
  program
    .name("publish-content")
    .description(
      "Publish a local .md file's content into post_contents on the backend DB, then index it into " +
        "Meilisearch (both done over SSH on the remote host - no tunnel needed).\n" +
        "Requires env vars REMOTE_HOST (SSH config alias or user@host), DATABASE_PATH, and MEILI_KEY " +
        "(the remote Meilisearch instance's master key)."
    )
    .requiredOption("--file <path>", "local .md file to publish")
    .requiredOption("--lang <lang>", "language code, e.g. en")
    .requiredOption(
      "--path <path>",
      "folder/slug, no extension, shared across languages, e.g. the-zk-chronicles/snarks-part-2 " +
        "(used as posts.path_identifier as-is, and as post_contents.path with .md appended)"
    )
    .parse(process.argv);

  const { file: localFile, lang, path: slugPath } = program.opts();

  if (!fs.existsSync(localFile)) {
    throw new Error(`File not found: ${localFile}`);
  }

  assertSafe(lang, "lang");
  assertSafe(slugPath, "path");

  const pathIdentifier = slugPath;
  const contentPath = `${slugPath}.md`;

  // Extracted purely so post_contents.thumbnail is queryable by SQL (e.g. by
  // the search API) without parsing frontmatter out of the raw content blob.
  const { data: frontmatter, content: body } = matter(fs.readFileSync(localFile, "utf8"));
  const thumbnail = frontmatter.thumbnail;
  if (thumbnail) {
    assertSafe(thumbnail, "thumbnail");
  }
  const thumbnailSql = thumbnail ? `'${thumbnail}'` : "NULL";

  const remoteHost = process.env.REMOTE_HOST;
  const databasePath = process.env.DATABASE_PATH;
  const meiliMasterKey = process.env.MEILI_KEY;

  if (!remoteHost) throw new Error("Set REMOTE_HOST (SSH config alias, or user@host)");
  if (!databasePath) throw new Error("Set DATABASE_PATH (path to blog.db on the remote host)");
  if (!meiliMasterKey) throw new Error("Set MEILI_KEY (Meilisearch master key on the remote host)");

  const remoteTempPath = `/tmp/arkana-publish-${Date.now()}-${path.basename(localFile)}`;

  console.log(`Uploading ${localFile} -> ${remoteHost}:${remoteTempPath}`);
  execFileSync("scp", [localFile, `${remoteHost}:${remoteTempPath}`], { stdio: "inherit" });

  try {
    console.log("Ensuring posts row exists...");
    ssh(
      remoteHost,
      `sqlite3 "${databasePath}" "INSERT OR IGNORE INTO posts (path_identifier) VALUES ('${pathIdentifier}');"`
    );

    const idJson = ssh(
      remoteHost,
      `sqlite3 -json "${databasePath}" "SELECT id FROM posts WHERE path_identifier = '${pathIdentifier}';"`
    );
    const postId = JSON.parse(idJson)[0]?.id;
    if (!postId) {
      throw new Error(`Could not resolve posts.id for path_identifier "${pathIdentifier}"`);
    }
    console.log(`posts.id = ${postId}`);

    console.log("Inserting post_contents row...");
    ssh(
      remoteHost,
      `sqlite3 "${databasePath}" "INSERT INTO post_contents (post_id, lang, path, content, thumbnail, visible) VALUES (${postId}, '${lang}', '${contentPath}', readfile('${remoteTempPath}'), ${thumbnailSql}, 1) ON CONFLICT (lang, path) DO UPDATE SET post_id = excluded.post_id, content = excluded.content, thumbnail = excluded.thumbnail, visible = excluded.visible, updated_at = CURRENT_TIMESTAMP;"`
    );

    const lenJson = ssh(
      remoteHost,
      `sqlite3 -json "${databasePath}" "SELECT length(content) AS len FROM post_contents WHERE post_id = ${postId} AND lang = '${lang}' ORDER BY id DESC LIMIT 1;"`
    );
    const remoteLength = JSON.parse(lenJson)[0]?.len;
    const localLength = fs.statSync(localFile).size;

    if (remoteLength !== localLength) {
      throw new Error(
        `Length mismatch: local file is ${localLength} bytes, DB content is ${remoteLength} bytes.`
      );
    }

    console.log(`Verified: ${remoteLength} bytes match. Done.`);

    console.log("Indexing into Meilisearch...");
    const indexUid = `posts_${lang}`;
    ensureTagSettings(remoteHost, meiliMasterKey, indexUid);
    await indexIntoMeilisearch(remoteHost, meiliMasterKey, indexUid, {
      id: `${lang}-${slugPath.replace(/\//g, "-")}`,
      lang,
      path: slugPath,
      title: frontmatter.title,
      description: frontmatter.description,
      tags: frontmatter.tags,
      content: stripMarkdown(body),
    });
    console.log(`Indexed into "${indexUid}".`);
  } finally {
    console.log("Cleaning up remote temp file...");
    try {
      ssh(remoteHost, `rm -f "${remoteTempPath}"`);
    } catch (cleanupError) {
      console.error(`Warning: failed to remove remote temp file: ${cleanupError.message}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
