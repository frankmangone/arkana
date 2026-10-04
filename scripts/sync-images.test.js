// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./sync-images.sh", import.meta.url));

let tmp;
let srcDir;
let destDir;

function write(root, rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function read(root, rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function sync(source = srcDir) {
  return execFileSync("bash", [script, source], {
    env: { ...process.env, ARKANA_IMAGES_DEST: destDir },
    encoding: "utf8",
  });
}

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sync-images-"));
  srcDir = path.join(tmp, "source");
  destDir = path.join(tmp, "public-images");
  fs.mkdirSync(srcDir);
  fs.mkdirSync(destDir);
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("sync-images.sh", () => {
  it("copies new images, keeping the directory layout", () => {
    write(srcDir, "series/article/a.webp", "one");
    sync();
    expect(read(destDir, "series/article/a.webp")).toBe("one");
  });

  it("copies filenames with special characters verbatim", () => {
    write(srcDir, "series/article/0*weird-5", "weird");
    sync();
    expect(read(destDir, "series/article/0*weird-5")).toBe("weird");
  });

  it("does not copy .DS_Store", () => {
    write(srcDir, ".DS_Store", "junk");
    write(srcDir, "series/.DS_Store", "junk");
    write(srcDir, "series/a.webp", "one");
    sync();
    expect(fs.existsSync(path.join(destDir, ".DS_Store"))).toBe(false);
    expect(fs.existsSync(path.join(destDir, "series/.DS_Store"))).toBe(false);
  });

  it("never deletes frontend-owned images that are absent from the source", () => {
    write(destDir, "arkana-default-og.png", "og");
    write(destDir, "writers/someone/avatar.png", "avatar");
    write(srcDir, "series/article/a.webp", "one");
    sync();
    expect(read(destDir, "arkana-default-og.png")).toBe("og");
    expect(read(destDir, "writers/someone/avatar.png")).toBe("avatar");
  });

  it("is idempotent: an identical image already in the frontend is not re-transferred", () => {
    write(srcDir, "series/article/a.webp", "same");
    write(destDir, "series/article/a.webp", "same");
    expect(sync()).not.toContain("a.webp");
  });

  it("is idempotent: a second run transfers nothing", () => {
    write(srcDir, "series/article/a.webp", "one");
    sync();
    expect(sync()).not.toContain("a.webp");
  });

  it("lets the source win when an image differs", () => {
    write(srcDir, "series/article/a.webp", "new");
    write(destDir, "series/article/a.webp", "old");
    sync();
    expect(read(destDir, "series/article/a.webp")).toBe("new");
  });

  it("exits non-zero when the source cannot be read", () => {
    let status;
    try {
      sync(path.join(tmp, "does-not-exist"));
    } catch (error) {
      status = error.status;
    }
    expect(status).toBeGreaterThan(0);
    expect(status).not.toBe(127); // 127 would mean the script itself is missing
  });
});
