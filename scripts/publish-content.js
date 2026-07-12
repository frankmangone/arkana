#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { Command } = require("commander");

// Restricts values embedded directly into the remote SQL string (below) to a
// safe character set, so no quote-escaping is needed and injection isn't possible.
const SAFE_PATTERN = /^[a-zA-Z0-9_\-./]+$/;

function assertSafe(value, label) {
  if (!SAFE_PATTERN.test(value)) {
    throw new Error(
      `Invalid ${label}: "${value}" (only letters, numbers, "_", "-", ".", "/" allowed)`
    );
  }
}

function ssh(remoteHost, remoteCommand) {
  return execFileSync("ssh", [remoteHost, remoteCommand], { encoding: "utf8" });
}

function main() {
  const program = new Command();
  program
    .name("publish-content")
    .description(
      "Publish a local .md file's content into post_content on the backend DB.\n" +
        "Requires env vars REMOTE_HOST (SSH config alias or user@host) and DATABASE_PATH."
    )
    .requiredOption("--file <path>", "local .md file to publish")
    .requiredOption("--lang <lang>", "language code, e.g. en")
    .requiredOption(
      "--path <path>",
      "folder/slug, no extension, shared across languages, e.g. the-zk-chronicles/snarks-part-2 " +
        "(used as posts.path_identifier as-is, and as post_content.path with .md appended)"
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

  const remoteHost = process.env.REMOTE_HOST;
  const databasePath = process.env.DATABASE_PATH;

  if (!remoteHost) throw new Error("Set REMOTE_HOST (SSH config alias, or user@host)");
  if (!databasePath) throw new Error("Set DATABASE_PATH (path to blog.db on the remote host)");

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

    console.log("Inserting post_content row...");
    ssh(
      remoteHost,
      `sqlite3 "${databasePath}" "INSERT INTO post_content (post_id, lang, path, content, visible) VALUES (${postId}, '${lang}', '${contentPath}', readfile('${remoteTempPath}'), 1);"`
    );

    const lenJson = ssh(
      remoteHost,
      `sqlite3 -json "${databasePath}" "SELECT length(content) AS len FROM post_content WHERE post_id = ${postId} AND lang = '${lang}' ORDER BY id DESC LIMIT 1;"`
    );
    const remoteLength = JSON.parse(lenJson)[0]?.len;
    const localLength = fs.statSync(localFile).size;

    if (remoteLength !== localLength) {
      throw new Error(
        `Length mismatch: local file is ${localLength} bytes, DB content is ${remoteLength} bytes.`
      );
    }

    console.log(`Verified: ${remoteLength} bytes match. Done.`);
  } finally {
    console.log("Cleaning up remote temp file...");
    try {
      ssh(remoteHost, `rm -f "${remoteTempPath}"`);
    } catch (cleanupError) {
      console.error(`Warning: failed to remove remote temp file: ${cleanupError.message}`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
