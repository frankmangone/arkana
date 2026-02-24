import fs from "fs/promises";
import path from "path";
import { createFrontmatter } from "./html-converter/frontmatter";
import { parseHtmlToMarkdownBody } from "./html-converter/parser";

interface ConvertHtmlOptions {
  outputDir: string;
  filename: string;
  mediumUrl?: string;
  title?: string;
}

export async function convertHtmlToMarkdown(
  htmlContent: string,
  options: ConvertHtmlOptions
): Promise<void> {
  const { outputDir, filename, mediumUrl, title: inputTitle } = options;

  const parsed = parseHtmlToMarkdownBody(htmlContent, inputTitle);

  const frontmatter = createFrontmatter({
    title: parsed.title,
    formattedDate: parsed.formattedDate,
    readingTime: parsed.readingTime,
    mediumUrl,
  });

  const finalMarkdown = `${frontmatter}\n${parsed.markdownBody}`;

  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${filename}.md`);
  await fs.writeFile(outputPath, finalMarkdown, "utf-8");
}
