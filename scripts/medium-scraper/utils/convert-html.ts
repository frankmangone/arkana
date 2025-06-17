import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

interface ConvertHtmlOptions {
  outputDir: string;
  filename: string;
}

export async function convertHtmlToMarkdown(
  htmlContent: string,
  options: ConvertHtmlOptions
): Promise<void> {
  const { outputDir, filename } = options;
  // Convert and save Markdown
  const markdownContent = await _convertHtmlToMarkdown(htmlContent);
  const mdPath = path.join(outputDir, `${filename}.md`);
  await fs.writeFile(mdPath, markdownContent, "utf-8");

  //   return { htmlPath, mdPath };
}

// Helper function to convert HTML to Markdown
async function _convertHtmlToMarkdown(htmlContent: string): Promise<string> {
  const $ = cheerio.load(htmlContent);

  // Extract title - Medium uses h1 with class pw-post-title
  const title = $("h1.pw-post-title").first().text().trim();
  console.log("Found title:", title);

  // Extract body content
  const content: string[] = [];

  // Find the main content div
  const mainContent = $("div.m").first();
  console.log("Found main content:", mainContent.length > 0);

  // Process all elements in order
  mainContent
    .find("h1, h2, h3, h4, h5, h6, p.pw-post-body-paragraph, pre, figure")
    .each((_, el) => {
      const $el = $(el);
      const tagName = $el.prop("tagName").toLowerCase();

      // Process headings
      if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName[1]);
        content.push(`\n${"#".repeat(level)} ${$el.text().trim()}\n`);
      }
      // Process paragraphs
      else if (tagName === "p" && $el.hasClass("pw-post-body-paragraph")) {
        const text = $el.text().trim();
        if (text) {
          content.push(`\n${text}\n`);
        }
      }
      // Process code blocks
      else if (tagName === "pre") {
        const code = $el.find("span").text().trim();
        if (code) {
          content.push(`\n\`\`\`\n${code}\n\`\`\`\n`);
        }
      }
      // Process images
      else if (tagName === "figure") {
        const img = $el.find("img");
        const src = img.attr("src");
        const alt = img.attr("alt") || "";
        if (src) {
          content.push(`\n![${alt}](${src})\n`);
        }
      }
    });

  // Get the processed content
  const markdownContent = content
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
    .trim();

  console.log("Content length:", markdownContent.length);
  console.log("First 200 chars of content:", markdownContent.substring(0, 200));

  // Combine title and content
  return `# ${title}\n\n${markdownContent}`;
}
