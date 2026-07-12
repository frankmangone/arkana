import { Command } from "commander";
import { search } from "./utils/meili-client";

interface ProgramOptions {
  query: string;
  lang: string;
}

async function run(options: ProgramOptions) {
  const indexUid = `posts_${options.lang}`;
  const result = await search(indexUid, options.query);

  console.log(JSON.stringify(result, null, 2));
}

const program = new Command();

program
  .name("search")
  .description("Search a per-language Meilisearch posts index")
  .requiredOption("-q, --query <text>", "Search query")
  .option("-l, --lang <lang>", "Language index to search", "en")
  .action((options: ProgramOptions) =>
    run(options).catch((error) => {
      console.error(error.message);
      process.exit(1);
    })
  );

if (require.main === module) {
  program.parse();
}
