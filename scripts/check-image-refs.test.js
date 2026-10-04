// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { extractImageRefs, findMissingRefs } = require("./check-image-refs.js");

describe("extractImageRefs", () => {
  it("finds html src, markdown images, plain and folded frontmatter thumbnails, and json strings", () => {
    const text = [
      "---",
      "thumbnail: /images/a/plain.webp",
      "other: >-",
      "  /images/a/folded.webp",
      "---",
      '<img src="/images/a/html.webp" />',
      "![alt](/images/a/markdown.png)",
      '{"avatar": "/images/writers/x/avatar.png"}',
    ].join("\n");
    expect(extractImageRefs(text).sort()).toEqual([
      "/images/a/folded.webp",
      "/images/a/html.webp",
      "/images/a/markdown.png",
      "/images/a/plain.webp",
      "/images/writers/x/avatar.png",
    ]);
  });

  it("ignores external URLs that merely contain /images/", () => {
    expect(
      extractImageRefs('<img src="https://cdn.example.com/images/a.png">')
    ).toEqual([]);
  });

  it("strips query and hash, decodes %20, keeps * in names, and dedupes", () => {
    const text =
      '"/images/a/my%20pic.webp?v=2" "/images/a/my%20pic.webp#x" "/images/a/0*weird-5"';
    expect(extractImageRefs(text).sort()).toEqual([
      "/images/a/0*weird-5",
      "/images/a/my pic.webp",
    ]);
  });

  it("does not throw on malformed percent-encoding", () => {
    expect(extractImageRefs('"/images/a/100%.webp"')).toEqual([
      "/images/a/100%.webp",
    ]);
  });
});

describe("findMissingRefs", () => {
  let tmp;
  let content;
  let images;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "check-refs-"));
    content = path.join(tmp, "content");
    images = path.join(tmp, "images");
    fs.mkdirSync(path.join(content, "en"), { recursive: true });
    fs.mkdirSync(path.join(images, "s"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("reports only the references whose file is absent, with the offending file", () => {
    fs.writeFileSync(path.join(images, "s", "present.webp"), "x");
    const post = path.join(content, "en", "post.md");
    fs.writeFileSync(
      post,
      'src="/images/s/present.webp"\nsrc="/images/s/absent.webp"'
    );
    const result = findMissingRefs({
      scanRoots: [content],
      imagesRoot: images,
    });
    expect(result.scanned).toBe(1);
    expect(result.missing).toEqual([
      { file: post, ref: "/images/s/absent.webp" },
    ]);
  });

  it("resolves names with spaces and asterisks against the filesystem", () => {
    fs.writeFileSync(path.join(images, "s", "my pic.webp"), "x");
    fs.writeFileSync(path.join(images, "s", "0*weird-5"), "x");
    fs.writeFileSync(
      path.join(content, "en", "post.md"),
      '"/images/s/my%20pic.webp" "/images/s/0*weird-5"'
    );
    expect(
      findMissingRefs({ scanRoots: [content], imagesRoot: images }).missing
    ).toEqual([]);
  });

  it("reports scanned = 0 when the scan roots do not exist, so the CLI can fail", () => {
    const result = findMissingRefs({
      scanRoots: [path.join(tmp, "nope")],
      imagesRoot: images,
    });
    expect(result).toEqual({ scanned: 0, missing: [] });
  });
});
