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
  title?: string;
}

// Helper function to download an image
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(filepath);

    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: "https://medium.com/",
      },
    };

    https
      .get(url, options, (response) => {
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
  const { outputDir, filename, mediumUrl, title } = options;
  // Convert and save Markdown
  const markdownContent = await _convertHtmlToMarkdown(
    htmlContent,
    outputDir,
    mediumUrl,
    title
  );
  const mdPath = path.join(outputDir, `${filename}.md`);
  await fs.writeFile(mdPath, markdownContent, "utf-8");

  //   return { htmlPath, mdPath };
}

// Helper function to convert HTML to Markdown
async function _convertHtmlToMarkdown(
  htmlContent: string,
  outputDir: string,
  mediumUrl?: string,
  articleTitle?: string
): Promise<string> {
  const $ = cheerio.load(htmlContent);

  // Use the title from RSS metadata if provided, otherwise extract from HTML
  const title = articleTitle || $("h3").first().text().trim() || $("h4").first().text().trim();
  console.log("Found title:", title);

  // Reading time and publish date are not available in RSS feed
  const readingTime: string = "";
  const publishDate: string = "";
  console.log("Reading time and publish date not available in RSS feed");

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

    // Convert strong tags to bold markdown
    html = html.replace(/<strong[^>]*>(.*?)<\/strong>/g, "**$1**");

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

    // Convert code tags to inline code
    html = html.replace(/<code[^>]*>(.*?)<\/code>/g, "`$1`");

    // Load the processed HTML and extract text
    const tempElement = cheerio.load(html);
    let text = tempElement.root().text().trim();

    // Replace unicode ellipsis with three dots
    text = text.replace(/…/g, "...");

    // Clean up extra whitespace
    text = text.replace(/\s+/g, " ");

    return text;
  }

  // Extract body content
  const content: string[] = [];
  const imageDownloads: Promise<void>[] = [];
  let imageIndex = 0;

  // RSS feed doesn't have a wrapping div, content is at root level
  // We'll process all elements from the body
  console.log("Processing RSS feed content");

  // Process all elements in order - RSS feeds have simpler structure
  $("h1, h2, h3, h4, h5, h6, p, pre, figure, blockquote, ul, ol").each((_, el) => {
      const $el = $(el);
      const tagName = $el.prop("tagName").toLowerCase();

      // Process headings
      if (tagName.match(/^h[1-6]$/)) {
        // Subtract 1 from level: h3 → ##, h4 → ###, etc.
        const htmlLevel = parseInt(tagName[1]);
        const markdownLevel = Math.max(1, htmlLevel - 1); // Ensure at least 1 #
        const headingText = processInlineElements($el);
        content.push(`\n${"#".repeat(markdownLevel)} ${headingText}\n`);
      }
      // Process paragraphs - RSS feed has simple p tags without classes
      else if (tagName === "p") {
        const text = processInlineElements($el);
        if (text) {
          content.push(`\n${text}\n`);
        }
      }
      // Process unordered lists
      else if (tagName === "ul") {
        console.log(
          "Found unordered list with",
          $el.find("li").length,
          "items"
        );
        const listItems: string[] = [];
        $el.find("li").each((_, liEl) => {
          const $li = $(liEl);
          const itemText = processInlineElements($li);
          if (itemText) {
            listItems.push(`- ${itemText}`);
            console.log("List item:", itemText);
          }
        });
        if (listItems.length > 0) {
          content.push(`\n${listItems.join("\n")}\n`);
        }
      }
      // Process ordered lists
      else if (tagName === "ol") {
        console.log("Found ordered list with", $el.find("li").length, "items");
        const listItems: string[] = [];
        $el.find("li").each((index, liEl) => {
          const $li = $(liEl);
          const itemText = processInlineElements($li);
          if (itemText) {
            listItems.push(`${index + 1}. ${itemText}`);
            console.log("List item:", itemText);
          }
        });
        if (listItems.length > 0) {
          content.push(`\n${listItems.join("\n")}\n`);
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
      // Process images - RSS feed has simpler structure
      else if (tagName === "figure") {
        const figcaption = $el.find("figcaption");
        const caption = figcaption.length > 0 ? figcaption.text().trim() : "";

        // RSS feed images are simpler - just img tags
        const img = $el.find("img");
        if (img.length > 0) {
          const imageUrl = img.attr("src");
          if (imageUrl) {
            // Keep the remote URL instead of downloading due to Cloudflare protection
            content.push(
              `\n<figure>\n\t<img\n\t\tsrc="${imageUrl}"\n\t\talt="" ${
                caption
                  ? `\n\t\ttitle="${caption.replace(/…/g, "...")}"`
                  : ""
              }\n\t/>\n</figure>\n`
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
