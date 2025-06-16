import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

export interface ScrapingOptions {
  outputDir?: string;
  filename?: string;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to get random user agent
const getRandomUserAgent = () => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

export async function downloadMediumArticle(
  url: string,
  options: ScrapingOptions = {}
) {
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

      // Add headers to mimic a browser request
      const response = await axios.get(url, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Cache-Control": "max-age=0",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          DNT: "1",
        },
        timeout: 10000, // 10 second timeout
      });

      // Load the HTML content into cheerio
      const $ = cheerio.load(response.data);

      // Extract the article content
      const articleContent = $("article").html();

      if (!articleContent) {
        throw new Error("No article content found");
      }

      // Create output directory if it doesn't exist
      const outputDir = options.outputDir || "downloads";
      await fs.mkdir(outputDir, { recursive: true });

      // Generate base filename if not provided
      const baseFilename = options.filename || `medium-article-${Date.now()}`;

      // Save HTML
      const htmlPath = path.join(outputDir, `${baseFilename}.html`);
      await fs.writeFile(htmlPath, articleContent, "utf-8");

      return articleContent;
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
