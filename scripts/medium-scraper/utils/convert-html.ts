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

  // Extract title
  const title = $("h1").first().text().trim();
  console.log("Found title:", title);

  // Extract body content - Medium uses specific classes for their content
  const article = $("article");

  // Remove unwanted elements
  article
    .find("script, style, iframe, .graf--trailing, .graf--kicker")
    .remove();

  // Process sections - Medium wraps content in sections
  const sections: string[] = [];

  article.find("section").each((_, section) => {
    const $section = $(section);
    let sectionContent = "";

    // Process headings
    $section.find("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const $el = $(el);
      const level = parseInt($el.prop("tagName")[1]);
      sectionContent += `\n${"#".repeat(level)} ${$el.text().trim()}\n`;
    });

    // Process paragraphs - Medium uses p.graf
    $section.find("p.graf").each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (text) {
        sectionContent += `\n${text}\n`;
      }
    });

    // Process lists
    $section.find("ul, ol").each((_, el) => {
      const $el = $(el);
      const isOrdered = $el.prop("tagName").toLowerCase() === "ol";
      $el.find("li").each((i, li) => {
        const $li = $(li);
        const text = $li.text().trim();
        if (text) {
          sectionContent += `${isOrdered ? `${i + 1}.` : "-"} ${text}\n`;
        }
      });
    });

    // Process links
    $section.find("a").each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href");
      const text = $el.text().trim();
      if (href && text) {
        sectionContent = sectionContent.replace(text, `[${text}](${href})`);
      }
    });

    // Process images
    $section.find("img").each((_, el) => {
      const $el = $(el);
      const src = $el.attr("src");
      const alt = $el.attr("alt") || "";
      if (src) {
        sectionContent += `\n![${alt}](${src})\n`;
      }
    });

    if (sectionContent.trim()) {
      sections.push(sectionContent);
    }
  });

  // If no sections found, try processing the article directly
  if (sections.length === 0) {
    console.log("No sections found, processing article directly...");

    // Process headings
    article.find("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const $el = $(el);
      const level = parseInt($el.prop("tagName")[1]);
      sections.push(`\n${"#".repeat(level)} ${$el.text().trim()}\n`);
    });

    // Process paragraphs
    article.find("p").each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (text) {
        sections.push(`\n${text}\n`);
      }
    });
  }

  // Get the processed content
  const content = sections
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
    .trim();

  console.log("Content length:", content.length);
  console.log("First 200 chars of content:", content.substring(0, 200));

  // Combine title and content
  return `# ${title}\n\n${content}`;
}
