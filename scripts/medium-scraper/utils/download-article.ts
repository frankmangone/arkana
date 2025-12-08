import axios from "axios";
import * as cheerio from "cheerio";
import { parseStringPromise } from "xml2js";
import fs from "fs/promises";
import path from "path";

export interface ScrapingOptions {
  outputDir?: string;
  filename?: string;
}

export interface ArticleData {
  content: string;
  title: string;
  link: string;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Extract username from Medium URL
const extractUsername = (url: string): string | null => {
  const match = url.match(/medium\.com\/@([^/]+)/);
  return match ? match[1] : null;
};

// Extract article slug from Medium URL
const extractArticleSlug = (url: string): string | null => {
  const match = url.match(/medium\.com\/@[^/]+\/([^?]+)/);
  return match ? match[1] : null;
};

export async function downloadMediumArticle(
  url: string,
  options: ScrapingOptions = {}
): Promise<ArticleData> {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  while (retryCount < maxRetries) {
    try {
      // Add a delay before each request (except the first one)
      if (retryCount > 0) {
        const delayTime = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
        console.log(
          `Retry ${retryCount + 1}/${maxRetries}. Waiting ${delayTime}ms...`
        );
        await delay(delayTime);
      }

      // Extract username from URL
      const username = extractUsername(url);
      if (!username) {
        throw new Error("Could not extract username from URL");
      }

      // Extract article slug to match against feed items
      const articleSlug = extractArticleSlug(url);
      if (!articleSlug) {
        throw new Error("Could not extract article slug from URL");
      }

      // Fetch the RSS feed for the author
      const rssUrl = `https://medium.com/feed/@${username}`;
      console.log(`Fetching RSS feed: ${rssUrl}`);

      const response = await axios.get(rssUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MediumScraper/1.0; +https://github.com)",
          Accept: "application/rss+xml, application/xml, text/xml",
        },
        timeout: 10000,
      });

      // Parse the RSS feed
      const feed = await parseStringPromise(response.data);
      const items = feed.rss.channel[0].item;

      if (!items || items.length === 0) {
        throw new Error("No articles found in RSS feed");
      }

      // Find the article that matches the slug
      const article = items.find((item: any) => {
        const itemLink = item.link?.[0] || "";
        return itemLink.includes(articleSlug);
      });

      if (!article) {
        throw new Error(
          `Article with slug "${articleSlug}" not found in RSS feed. It might not be in the recent articles.`
        );
      }

      // Extract article metadata and content
      const articleTitle = article.title?.[0] || "";
      const articleLink = article.link?.[0] || url;
      const articleContent =
        article["content:encoded"]?.[0] || article.description?.[0];

      if (!articleContent) {
        throw new Error("No article content found in RSS feed");
      }

      // Create output directory if it doesn't exist
      const outputDir = options.outputDir || "downloads";
      await fs.mkdir(outputDir, { recursive: true });

      // Generate base filename if not provided
      const baseFilename = options.filename || `medium-article-${Date.now()}`;

      // Save HTML
      const htmlPath = path.join(outputDir, `${baseFilename}.html`);
      await fs.writeFile(htmlPath, articleContent, "utf-8");

      console.log(`Article saved to: ${htmlPath}`);

      return {
        content: articleContent,
        title: articleTitle,
        link: articleLink,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      lastError = error;

      // If it's a rate limit error, we'll retry
      if (error.response?.status === 429) {
        retryCount++;
        continue;
      }

      // For other errors, we'll throw immediately
      throw error;
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
}
