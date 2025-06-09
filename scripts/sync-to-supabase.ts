#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  ExtractedData,
  ArticleData,
  SyncResult,
  SyncOptions,
  SupabaseArticle,
} from "./types";

// Import CommonJS modules
const matter = require("gray-matter");
const { processMarkdownFile } = require("./extract-search-data/index");

// Load environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Extract language from file path
function extractLanguage(filePath: string): string {
  const pathParts = filePath.split("/");
  const contentIndex = pathParts.findIndex(
    (part: string) => part === "content"
  );

  if (contentIndex !== -1 && contentIndex + 1 < pathParts.length) {
    return pathParts[contentIndex + 1]; // en, es, pt, etc
  }

  // Fallback to 'en' if we can't determine
  return "en";
}

// Generate slug from file path
function generateSlug(filePath: string): string {
  const pathParts = filePath.split("/");
  const contentIndex = pathParts.findIndex(
    (part: string) => part === "content"
  );

  if (contentIndex !== -1 && contentIndex + 2 < pathParts.length) {
    // Get folder and filename
    const folder = pathParts[contentIndex + 2]; // blockchain-101, cryptography-101, etc
    const filename = path.basename(filePath, path.extname(filePath));
    return `${folder}/${filename}`;
  }

  // Fallback to just filename
  return path.basename(filePath, path.extname(filePath));
}

// Check if article exists in Supabase by slug AND language
async function findExistingArticle(
  slug: string,
  language: string
): Promise<SupabaseArticle | null> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("language", language)
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.articles" does not exist')) {
        throw new Error(
          "Articles table does not exist. Please check your Supabase setup."
        );
      }
      console.error("❌ Error searching for existing article:", error.message);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    // Re-throw our custom errors, or wrap generic ones
    if (
      error instanceof Error &&
      error.message.includes("Articles table does not exist")
    ) {
      throw error;
    }
    console.error(
      "❌ Error searching for existing article:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

// Create new article in Supabase
async function createArticle(articleData: ArticleData): Promise<SyncResult> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating article:", error.message);
      return { success: false, error };
    }

    console.log(`✅ Created new article: ${data.title} (UUID: ${data.uuid})`);
    return { success: true, data };
  } catch (error) {
    console.error(
      "❌ Error creating article:",
      error instanceof Error ? error.message : String(error)
    );
    return { success: false, error };
  }
}

// Update existing article in Supabase
async function updateArticle(
  articleUuid: string,
  articleData: ArticleData
): Promise<SyncResult> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .update(articleData)
      .eq("uuid", articleUuid)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating article:", error.message);
      return { success: false, error };
    }

    console.log(
      `✅ Updated existing article: ${data.title} (UUID: ${data.uuid})`
    );
    return { success: true, data };
  } catch (error) {
    console.error(
      "❌ Error updating article:",
      error instanceof Error ? error.message : String(error)
    );
    return { success: false, error };
  }
}

// Write UUID back to markdown file frontmatter
function updateMarkdownWithUuid(filePath: string, uuid: string): boolean {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data: frontMatter, content } = matter(fileContent);

    // Add or update the supabaseId in frontmatter
    frontMatter.supabaseId = uuid;

    // Rebuild the file
    const updatedFile = matter.stringify(content, frontMatter);
    fs.writeFileSync(filePath, updatedFile);

    console.log(`📝 Updated ${filePath} with Supabase ID: ${uuid}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error updating markdown file:`,
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

// Convert extracted data to Supabase article format
function mapToSupabaseArticle(
  extractedData: ExtractedData,
  filePath: string,
  language: string
): ArticleData {
  const slug = generateSlug(filePath);

  return {
    title: extractedData.title,
    slug: slug,
    language: language,
    author: extractedData.author,
    thumbnail: extractedData.thumbnail,
    // Search and analysis fields
    word_count: extractedData.word_count,
    headings_structure: extractedData.headings_structure,
    search_keywords: extractedData.search_keywords,
    search_summary: extractedData.search_summary,
    search_tags_expanded: extractedData.search_tags_expanded,
    search_headings:
      extractedData.search_headings ||
      extractedData.headings_structure.map((h) => h.text).join(" "),
  };
}

// Main pipeline function
async function syncMarkdownToSupabase(
  filePath: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const { forceUpdate = false } = options;

  console.log(`🚀 Starting sync pipeline for: ${filePath}`);
  if (forceUpdate) {
    console.log(
      `⚡ Force update mode enabled - will update regardless of changes`
    );
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return { success: false, error: "File not found" };
  }

  // Extract language from path
  const language = extractLanguage(filePath);
  console.log(`🌍 Detected language: ${language}`);

  // Generate slug
  const slug = generateSlug(filePath);
  console.log(`🔗 Generated slug: ${slug}`);

  // Extract search data
  console.log(`📊 Extracting search data...`);
  const extractedData = processMarkdownFile(filePath) as ExtractedData | null;

  if (!extractedData) {
    console.error(`❌ Failed to extract data from ${filePath}`);
    return { success: false, error: "Data extraction failed" };
  }

  console.log(
    `   📊 Extracted ${
      extractedData.search_keywords.split(" ").length
    } keywords`
  );
  console.log(
    `   📝 Summary: ${extractedData.search_summary.length} characters`
  );
  console.log(
    `   🏷️ Headings: ${extractedData.headings_structure.length} found`
  );
  console.log(`   💬 Word count: ${extractedData.word_count} words`);
  if (extractedData.author) {
    console.log(`   👤 Author: ${extractedData.author}`);
  }
  if (extractedData.thumbnail) {
    console.log(`   🖼️ Thumbnail: ${extractedData.thumbnail}`);
  }

  // Check if article already exists
  console.log(`🔍 Checking if article exists in Supabase...`);
  const existingArticle = await findExistingArticle(slug, language);

  // Prepare article data
  const articleData = mapToSupabaseArticle(extractedData, filePath, language);

  let result: SyncResult;

  if (existingArticle) {
    console.log(
      `📄 Found existing article: ${existingArticle.title} (UUID: ${existingArticle.uuid})`
    );

    // Check if content has changed or if new fields are missing
    const contentChanged =
      existingArticle.search_summary !== extractedData.search_summary ||
      existingArticle.word_count !== extractedData.word_count;

    const fieldsNeedUpdate =
      (extractedData.author &&
        existingArticle.author !== extractedData.author) ||
      (extractedData.thumbnail &&
        existingArticle.thumbnail !== extractedData.thumbnail) ||
      (!existingArticle.author && extractedData.author) || // Missing author field
      (!existingArticle.thumbnail && extractedData.thumbnail); // Missing thumbnail field

    if (!forceUpdate && !contentChanged && !fieldsNeedUpdate) {
      console.log(
        `⏭️ Content unchanged and fields up-to-date, skipping update`
      );
      return {
        success: true,
        action: "skipped",
        data: existingArticle,
        message: "Content unchanged and fields up-to-date",
      };
    }

    // Log what triggered the update
    if (forceUpdate) {
      console.log(`🔄 Force updating article...`);
    } else if (contentChanged) {
      console.log(`🔄 Content has changed, updating article...`);
    }
    if (fieldsNeedUpdate) {
      console.log(`🔄 Author/thumbnail fields need update...`);
      if (!existingArticle.author && extractedData.author) {
        console.log(`   👤 Adding author: ${extractedData.author}`);
      }
      if (!existingArticle.thumbnail && extractedData.thumbnail) {
        console.log(`   🖼️ Adding thumbnail: ${extractedData.thumbnail}`);
      }
    }

    // Update existing article
    console.log(`🔄 Updating existing article...`);
    result = await updateArticle(existingArticle.uuid!, articleData);

    if (result.success) {
      // Update markdown with existing UUID (in case it's missing)
      updateMarkdownWithUuid(filePath, existingArticle.uuid!);
      return {
        success: true,
        action: "updated",
        data: result.data,
        uuid: existingArticle.uuid,
      };
    }
  } else {
    console.log(`➕ Article not found, creating new record...`);

    // Create new article
    result = await createArticle({
      ...articleData,
      created_at: new Date().toISOString(),
    });

    if (result.success && result.data) {
      // Update markdown with new UUID
      updateMarkdownWithUuid(filePath, result.data.uuid!);
      return {
        success: true,
        action: "created",
        data: result.data,
        uuid: result.data.uuid,
      };
    }
  }

  return { success: false, error: result.error };
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Check for force update flag
  const forceUpdateIndex = args.indexOf("--force-update");
  const forceUpdate = forceUpdateIndex !== -1;

  // Remove the flag from args to get the file path
  if (forceUpdateIndex !== -1) {
    args.splice(forceUpdateIndex, 1);
  }

  if (args.length === 0) {
    console.log("📚 Supabase Sync Pipeline");
    console.log("");
    console.log("Usage:");
    console.log(
      "  node sync-to-supabase.js <markdown-file-path> [--force-update]"
    );
    console.log("");
    console.log("Examples:");
    console.log(
      "  node sync-to-supabase.js ./src/content/en/blockchain-101/consensus.md"
    );
    console.log(
      "  node sync-to-supabase.js ./src/content/es/cryptography-101/hashing.md --force-update"
    );
    console.log("");
    console.log("Flags:");
    console.log(
      "  --force-update    Force update even if content hasn't changed"
    );
    console.log("");
    console.log("What this script does:");
    console.log("  1. 📊 Extracts search data from markdown");
    console.log("  2. 🔍 Checks if article exists in Supabase");
    console.log("  3. ➕ Creates new record OR 🔄 updates existing");
    console.log("  4. 📝 Writes Supabase UUID back to markdown frontmatter");
    console.log("  5. 🌍 Automatically detects language from file path");
    console.log("");
    process.exit(1);
  }

  const filePath = args[0];

  try {
    const result = await syncMarkdownToSupabase(filePath, { forceUpdate });

    if (result.success) {
      console.log("");
      console.log("🎉 Sync completed successfully!");
      console.log(`   Action: ${result.action}`);
      console.log(`   UUID: ${result.uuid || result.data?.uuid}`);
      console.log(`   Title: ${result.data?.title}`);

      if (result.action === "skipped") {
        console.log(`   Reason: ${result.message}`);
      }
    } else {
      console.log("");
      console.log("❌ Sync failed!");
      console.log(`   Error: ${JSON.stringify(result.error)}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      "❌ Unexpected error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
}

export {
  syncMarkdownToSupabase,
  extractLanguage,
  generateSlug,
  findExistingArticle,
  updateMarkdownWithUuid,
};
