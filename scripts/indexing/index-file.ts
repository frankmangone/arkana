import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { Command } from "commander";
import { ensureFilterableTags, indexDocument } from "./utils/meili-client";
import { stripMarkdown } from "./utils/strip-markdown";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

function parseFilePath(filePath: string) {
  const absolute = path.resolve(filePath);
  const rel = path.relative(CONTENT_ROOT, absolute);

  if (rel.startsWith("..") || rel === "") {
    throw new Error(
      `File must be under src/content/<lang>/... (got: ${filePath})`
    );
  }

  const segments = rel.split(path.sep);
  const lang = segments[0];
  const slugPath = segments.slice(1).join("/").replace(/\.md$/, "");

  return { lang, slugPath };
}

interface ProgramOptions {
  file: string;
}

async function run(file: string) {
  const filePath = path.resolve(file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const { lang, slugPath } = parseFilePath(filePath);
  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));

  const document = {
    id: `${lang}-${slugPath.replace(/\//g, "-")}`,
    lang,
    path: slugPath,
    title: data.title,
    description: data.description,
    tags: data.tags,
    content: stripMarkdown(content),
  };

  const indexUid = `posts_${lang}`;

  console.log(`Ensuring "${indexUid}" allows filtering by tags...`);
  await ensureFilterableTags(indexUid);

  console.log(`Indexing "${slugPath}" into "${indexUid}"...`);
  const task = await indexDocument(indexUid, document);
  console.log(JSON.stringify(task, null, 2));
}

const program = new Command();

program
  .name("index-file")
  .description(
    "Index a single markdown file (src/content/<lang>/...) into its per-language Meilisearch index"
  )
  .requiredOption("-f, --file <filePath>", "Path to the markdown file to index")
  .action((options: ProgramOptions) =>
    run(options.file).catch((error) => {
      console.error(error.message);
      process.exit(1);
    })
  );

if (require.main === module) {
  program.parse();
}
