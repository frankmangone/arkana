import { Command } from "commander";
import {
  downloadMediumArticle,
  ScrapingOptions,
} from "./utils/download-article";
import { convertHtmlToMarkdown } from "./utils/convert-html";

interface ProgramOptions extends ScrapingOptions {
  url: string;
}

// Set up Commander
const program = new Command();

const scrap = async (options: ProgramOptions) => {
  const { url, outputDir = "downloads", filename = "article" } = options;

  const article = await downloadMediumArticle(url, {
    outputDir,
    filename,
  });

  await convertHtmlToMarkdown(article, {
    outputDir,
    filename,
  });
};

program
  .name("medium-scraper")
  .description("Download Medium articles as HTML and Markdown")
  .version("1.0.0")
  .requiredOption("-u, --url <url>", "URL of the Medium article to download")
  .option(
    "-o, --output-dir <dir>",
    "Output directory for the downloaded article",
    "downloads"
  )
  .option("-f, --filename <name>", "Output filename for the downloaded article")
  .action(async (options: ProgramOptions) => {
    try {
      await scrap(options);
    } catch (error) {
      console.error("Failed to download article:", error);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
}

export { downloadMediumArticle };
