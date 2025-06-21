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

  // Helper function to process inline elements in text
  function processInlineElements(element: cheerio.Cheerio): string {
    let html = element.html() || "";

    // Convert em tags with class "ni" to bold markdown
    html = html.replace(/<em class="ni">(.*?)<\/em>/g, "**$1**");

    // Convert links to markdown format
    html = html.replace(
      /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g,
      (match, href, text) => {
        // Check if the link is to Medium (contains medium.com or starts with /)
        const isMediumLink =
          href.includes("medium.com") ||
          href.startsWith("/") ||
          href.startsWith("#");

        if (isMediumLink) {
          return `[${text}]()`;
        } else {
          return `[${text}](${href})`;
        }
      }
    );

    // Load the processed HTML and extract text
    const tempElement = cheerio.load(html);
    let text = tempElement.root().text().trim();

    // Replace unicode ellipsis with three dots
    text = text.replace(/…/g, "...");

    return text;
  }

  // Extract body content
  const content: string[] = [];

  // Find the main content div
  const mainContent = $("div.m").first();
  console.log("Found main content:", mainContent.length > 0);

  // Process all elements in order
  mainContent
    .find(
      "h1, h2, p.pw-post-body-paragraph, pre, figure, blockquote, div[role='separator']"
    )
    .each((_, el) => {
      const $el = $(el);
      const tagName = $el.prop("tagName").toLowerCase();

      // Process headings
      if (tagName.match(/^h[1-6]$/)) {
        const level = parseInt(tagName[1]);
        const headingText = processInlineElements($el);
        content.push(`\n${"#".repeat(level + 1)} ${headingText}\n`);
      }
      // Process paragraphs
      else if (tagName === "p" && $el.hasClass("pw-post-body-paragraph")) {
        const text = processInlineElements($el);
        if (text) {
          content.push(`\n${text}\n`);
        }
      }
      // Process blockquotes
      else if (tagName === "blockquote") {
        const text = processInlineElements($el);
        if (text) {
          // Check if this is a big quote (class "pr") or regular blockquote
          if ($el.hasClass("pr")) {
            // Big quote format
            content.push(`\n::: big-quote\n${text}\n:::\n`);
          } else {
            // Regular blockquote format
            const quotedText = text
              .split("\n")
              .map((line) => `> ${line}`)
              .join("\n");
            content.push(`\n${quotedText}\n`);
          }
        }
      }
      // Process section separators (three dots)
      else if (tagName === "div" && $el.attr("role") === "separator") {
        content.push(`\n---\n`);
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
        // Check if this is a paragraph-image figure
        if ($el.hasClass("paragraph-image")) {
          const figcaption = $el.find("figcaption");
          const caption = figcaption.length > 0 ? figcaption.text().trim() : "";

          content.push(
            `\n<figure\n\tsrc=""\n\talt="" ${
              caption ? `\n\ttitle="${caption.replace(/…/g, "...")}"` : ""
            }\n/>\n`
          );
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
