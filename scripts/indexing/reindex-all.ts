import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { ensureFilterableTags, indexDocuments } from "./utils/meili-client";
import { stripMarkdown } from "./utils/strip-markdown";

// Bulk re-index: walks every src/content/<lang>/**/*.md, applies index
// settings (filterable tags + count-sorted facets), and indexes each
// language's posts in one batch.
//
//   MEILI_HOST=<host> MEILI_KEY=<key> pnpm run index:all

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

async function run() {
  const langs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const lang of langs) {
    const langRoot = path.join(CONTENT_ROOT, lang);
    const documents: Array<Record<string, unknown>> = [];
    const skipped: string[] = [];

    for (const filePath of walk(langRoot)) {
      const { data, content } = matter(fs.readFileSync(filePath, "utf8"));

      // Non-post markdown (READMEs and the like) has no title frontmatter
      if (!data.title) {
        skipped.push(path.relative(CONTENT_ROOT, filePath));
        continue;
      }

      const slugPath = path
        .relative(langRoot, filePath)
        .split(path.sep)
        .join("/")
        .replace(/\.md$/, "");

      documents.push({
        id: `${lang}-${slugPath.replace(/\//g, "-")}`,
        lang,
        path: slugPath,
        title: data.title,
        description: data.description,
        tags: data.tags,
        content: stripMarkdown(content),
      });
    }

    const indexUid = `posts_${lang}`;
    console.log(`\n${indexUid}: ${documents.length} posts found`);
    for (const file of skipped) {
      console.log(`  skipped (no title frontmatter): ${file}`);
    }
    if (documents.length === 0) continue;

    console.log(`  applying index settings...`);
    await ensureFilterableTags(indexUid);

    console.log(`  indexing ${documents.length} documents...`);
    const task = await indexDocuments(indexUid, documents);
    console.log(`  done (task status: ${task.status})`);
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
