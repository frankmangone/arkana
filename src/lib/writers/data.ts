import fs from "fs";
import path from "path";
import { Writer } from "./types";

const DATA_DIR = path.join(process.cwd(), "src", "data", "writers");

// Deliberately uncached: these JSON files are hand-edited during local dev, and
// Next's file watcher doesn't know to invalidate a plain fs.readFileSync() call
// the way it does for source files. Re-reading a handful of small JSON files
// is negligible next to everything else a page render already does.
export function loadWriters(): Record<string, Writer> {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith(".json"));

  return Object.fromEntries(
    files.map((file) => {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
      const writer = JSON.parse(raw) as Writer;
      return [writer.slug, writer];
    })
  );
}
