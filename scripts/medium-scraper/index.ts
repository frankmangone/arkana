import { Command } from "commander";
import {
  downloadMediumArticle,
  ScrapingOptions,
} from "./utils/download-article";
import { convertHtmlToMarkdown } from "./utils/convert-html";
import fs from "fs/promises";

interface ProgramOptions extends ScrapingOptions {
  url?: string;
  htmlFile?: string;
}

// Set up Commander
const program = new Command();

const scrap = async (options: ProgramOptions) => {
  const {
    url,
    htmlFile,
    outputDir = "downloads",
    filename = "article",
  } = options;

  if (htmlFile) {
    // Convert existing HTML file
    console.log(`Converting HTML file: ${htmlFile}`);
    const htmlContent = await fs.readFile(htmlFile, "utf-8");
    await convertHtmlToMarkdown(htmlContent, {
      outputDir,
      filename,
    });
  } else if (url) {
    // Download and convert from URL
    const article = await downloadMediumArticle(url, {
      outputDir,
      filename,
    });

    await convertHtmlToMarkdown(article, {
      outputDir,
      filename,
    });
  } else {
    throw new Error("Either --url or --html-file must be provided");
  }
};

program
  .name("medium-scraper")
  .description("Download Medium articles as HTML and Markdown")
  .version("1.0.0")
  .option("-u, --url <url>", "URL of the Medium article to download")
  .option("-f, --html-file <file>", "Convert existing HTML file to Markdown")
  .option(
    "-o, --output-dir <dir>",
    "Output directory for the downloaded article",
    "downloads"
  )
  .option("-n, --filename <name>", "Output filename for the downloaded article")
  .action(async (options: ProgramOptions) => {
    try {
      await scrap(options);
    } catch (error) {
      console.error("Failed to process article:", error);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
}

export { downloadMediumArticle };
