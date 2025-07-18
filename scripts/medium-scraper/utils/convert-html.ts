import * as cheerio from "cheerio";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import path from "path";
import https from "https";
import { URL } from "url";

interface ConvertHtmlOptions {
  outputDir: string;
  filename: string;
  mediumUrl?: string;
}

// Helper function to download an image
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filepath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve();
        });

        file.on("error", (err) => {
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Helper function to get a filename from URL
function getImageFilename(url: string, index: number): string {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const filename = path.basename(pathname);

    // If we can't get a good filename, create one
    if (!filename || filename === "/") {
      const extension = url.includes(".jpg")
        ? ".jpg"
        : url.includes(".png")
        ? ".png"
        : ".jpg";
      return `image-${index}${extension}`;
    }

    // Add index to avoid conflicts
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    return `${name}-${index}${ext}`;
  } catch {
    // Fallback filename
    const extension = url.includes(".jpg")
      ? ".jpg"
      : url.includes(".png")
      ? ".png"
      : ".jpg";
    return `image-${index}${extension}`;
  }
}

// Helper function to extract the best quality image URL from srcset
function getBestImageUrl(srcset: string): string {
  const sources = srcset.split(",").map((s) => s.trim());
  let bestUrl = "";
  let maxWidth = 0;

  for (const source of sources) {
    const parts = source.split(" ");
    if (parts.length >= 2) {
      const url = parts[0];
      const widthStr = parts[1];
      const width = parseInt(widthStr.replace("w", ""));

      if (width > maxWidth) {
        maxWidth = width;
        bestUrl = url;
      }
    }
  }

  return bestUrl || sources[0]?.split(" ")[0] || "";
}

export async function convertHtmlToMarkdown(
  htmlContent: string,
  options: ConvertHtmlOptions
): Promise<void> {
  const { outputDir, filename, mediumUrl } = options;
  // Convert and save Markdown
  const markdownContent = await _convertHtmlToMarkdown(
    htmlContent,
    outputDir,
    mediumUrl
  );
  const mdPath = path.join(outputDir, `${filename}.md`);
  await fs.writeFile(mdPath, markdownContent, "utf-8");

  //   return { htmlPath, mdPath };
}

// Helper function to convert HTML to Markdown
async function _convertHtmlToMarkdown(
  htmlContent: string,
  outputDir: string,
  mediumUrl?: string
): Promise<string> {
  const $ = cheerio.load(htmlContent);

  // Extract title - Medium uses h1 with class pw-post-title
  const title = $("h1.pw-post-title").first().text().trim();
  console.log("Found title:", title);

  // Extract reading time
  const readingTimeElement = $('[data-testid="storyReadTime"]');
  const readingTime =
    readingTimeElement.length > 0 ? readingTimeElement.text().trim() : "";
  console.log("Found reading time:", readingTime);

  // Extract publish date
  const publishDateElement = $('[data-testid="storyPublishDate"]');
  const publishDate =
    publishDateElement.length > 0 ? publishDateElement.text().trim() : "";
  console.log("Found publish date:", publishDate);

  // Convert publish date to YYYY-MM-DD format
  function formatDate(dateString: string): string {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      console.warn("Could not parse date:", dateString);
      return dateString; // Return original if parsing fails
    }
  }

  const formattedDate = formatDate(publishDate);
  console.log("Formatted date:", formattedDate);

  // Helper function to process inline elements in text
  function processInlineElements(element: cheerio.Cheerio): string {
    let html = element.html() || "";

    // Convert em tags with various classes to bold markdown
    // Medium uses different classes like "mj", "ni", etc. for italics that should become bold
    html = html.replace(
      /<em class="(?:mj|ni|[a-z]{1,3})"[^>]*>(.*?)<\/em>/g,
      "**$1**"
    );

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
  const imageDownloads: Promise<void>[] = [];
  let imageIndex = 0;
  let isFirstHeading = true; // Flag to skip the first heading (article title)

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
        // Skip the first heading as it's the article title (already in frontmatter)
        if (isFirstHeading) {
          isFirstHeading = false;
          return;
        }

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

          // Find the best image source - prefer WebP format (first source) over fallback
          const sources = $el.find("source");
          if (sources.length > 0) {
            // Use the first source (WebP format) instead of the fallback
            const srcset = sources.first().attr("srcset");
            if (srcset) {
              const imageUrl = getBestImageUrl(srcset);
              if (imageUrl) {
                imageIndex++;
                const filename = getImageFilename(imageUrl, imageIndex);
                const filepath = path.join(outputDir, filename);

                // Add download promise
                imageDownloads.push(
                  downloadImage(imageUrl, filepath).catch((err) => {
                    console.error(`Failed to download image ${imageUrl}:`, err);
                  })
                );

                // Add figure placeholder with local file reference
                content.push(
                  `\n<figure>\n\t<img\n\t\tsrc="./${filename}"\n\t\talt="" ${
                    caption
                      ? `\n\t\ttitle="${caption.replace(/…/g, "...")}"`
                      : ""
                  }\n\t/>\n</figure>\n`
                );
              }
            }
          }

          // Fallback if no image found
          if (!$el.find("source").length) {
            content.push(
              `\n<figure\n\tsrc=""\n\talt="" ${
                caption ? `\n\ttitle="${caption.replace(/…/g, "...")}"` : ""
              }\n/>\n`
            );
          }
        }
      }
    });

  // Wait for all image downloads to complete
  console.log(`Starting download of ${imageDownloads.length} images...`);
  await Promise.allSettled(imageDownloads);
  console.log("Image downloads completed.");

  // Get the processed content
  const markdownContent = content
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
    .trim();

  console.log("Content length:", markdownContent.length);
  console.log("First 200 chars of content:", markdownContent.substring(0, 200));

  // Create frontmatter
  const frontmatter = [
    "---",
    `title: '${title.replace(/'/g, "''")}'`, // Escape single quotes
    formattedDate ? `date: '${formattedDate}'` : "",
    "author: frank-mangone",
    "thumbnail: # TODO: Add thumbnail path",
    "tags:",
    "  # TODO: Add tags",
    "description: >-",
    "  # TODO: Add description",
    readingTime ? `readingTime: ${readingTime.replace("min read", "min")}` : "",
    mediumUrl ? `mediumUrl: ${mediumUrl}` : "",
    "contentHash: # TODO: Add content hash",
    "supabaseId: # TODO: Add supabase ID",
    "---",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  // Combine frontmatter and content
  return `${frontmatter}\n${markdownContent}`;
}
