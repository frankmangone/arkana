import { Command } from "commander";
import { indexArticle } from "./utils/index-article";

interface ProgramOptions {
  path: string;
}

const program = new Command();

const index = async (options: ProgramOptions) => {
  const { path } = options;

  try {
    indexArticle(path);
  } catch (error) {
    console.error("Failed to index article:", error);
    process.exit(1);
  }
};

program
  .name("index-one")
  .description("Index a single article")
  .version("1.0.0")
  .requiredOption("-p, --path <filePath>", "Path to the article to index")
  .action((options: ProgramOptions) => index(options));

if (require.main === module) {
  program.parse();
}
