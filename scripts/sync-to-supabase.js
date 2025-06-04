#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { processMarkdownFile } = require("./extract-search-data.js");
require("dotenv").config();

// Import Supabase client
const { createClient } = require("@supabase/supabase-js");

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
function extractLanguage(filePath) {
  const pathParts = filePath.split("/");
  const contentIndex = pathParts.findIndex((part) => part === "content");

  if (contentIndex !== -1 && contentIndex + 1 < pathParts.length) {
    return pathParts[contentIndex + 1]; // en, es, pt, etc
  }

  // Fallback to 'en' if we can't determine
  return "en";
}

// Generate slug from file path
function generateSlug(filePath) {
  const pathParts = filePath.split("/");
  const contentIndex = pathParts.findIndex((part) => part === "content");

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
async function findExistingArticle(slug, language) {
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
    if (error.message.includes("Articles table does not exist")) {
      throw error;
    }
    console.error("❌ Error searching for existing article:", error.message);
    return null;
  }
}

// Create new article in Supabase
async function createArticle(articleData) {
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
    console.error("❌ Error creating article:", error.message);
    return { success: false, error };
  }
}

// Update existing article in Supabase
async function updateArticle(articleUuid, articleData) {
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
    console.error("❌ Error updating article:", error.message);
    return { success: false, error };
  }
}

// Write UUID back to markdown file frontmatter
function updateMarkdownWithUuid(filePath, uuid) {
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
    console.error(`❌ Error updating markdown file:`, error.message);
    return false;
  }
}

// Convert extracted data to Supabase article format
function mapToSupabaseArticle(extractedData, filePath, language) {
  const slug = generateSlug(filePath);

  return {
    title: extractedData.title,
    slug: slug,
    language: language,
    author_slug: extractedData.author, // Map author to author_slug
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
async function syncMarkdownToSupabase(filePath) {
  console.log(`🚀 Starting sync pipeline for: ${filePath}`);

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
  const extractedData = processMarkdownFile(filePath);

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

  // Check if article already exists
  console.log(`🔍 Checking if article exists in Supabase...`);
  const existingArticle = await findExistingArticle(slug, language);

  // Prepare article data
  const articleData = mapToSupabaseArticle(extractedData, filePath, language);

  let result;

  if (existingArticle) {
    console.log(
      `📄 Found existing article: ${existingArticle.title} (UUID: ${existingArticle.uuid})`
    );

    // Check if content has changed by comparing search summary or word count
    const contentChanged =
      existingArticle.search_summary !== extractedData.search_summary ||
      existingArticle.word_count !== extractedData.word_count;

    if (!contentChanged) {
      console.log(`⏭️ Content unchanged, skipping update`);
      return {
        success: true,
        action: "skipped",
        data: existingArticle,
        message: "Content unchanged",
      };
    }

    // Update existing article
    console.log(`🔄 Updating existing article...`);
    result = await updateArticle(existingArticle.uuid, articleData);

    if (result.success) {
      // Update markdown with existing UUID (in case it's missing)
      updateMarkdownWithUuid(filePath, existingArticle.uuid);
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

    if (result.success) {
      // Update markdown with new UUID
      updateMarkdownWithUuid(filePath, result.data.uuid);
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
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("📚 Supabase Sync Pipeline");
    console.log("");
    console.log("Usage:");
    console.log("  node sync-to-supabase.js <markdown-file-path>");
    console.log("");
    console.log("Examples:");
    console.log(
      "  node sync-to-supabase.js ./src/content/en/blockchain-101/consensus.md"
    );
    console.log(
      "  node sync-to-supabase.js ./src/content/es/cryptography-101/hashing.md"
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
    const result = await syncMarkdownToSupabase(filePath);

    if (result.success) {
      console.log("");
      console.log("🎉 Sync completed successfully!");
      console.log(`   Action: ${result.action}`);
      console.log(`   UUID: ${result.uuid || result.data.uuid}`);
      console.log(`   Title: ${result.data.title}`);

      if (result.action === "skipped") {
        console.log(`   Reason: ${result.message}`);
      }
    } else {
      console.log("");
      console.log("❌ Sync failed!");
      console.log(`   Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
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

module.exports = {
  syncMarkdownToSupabase,
  extractLanguage,
  generateSlug,
  findExistingArticle,
  updateMarkdownWithUuid,
};
