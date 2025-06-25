#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

import * as fs from "fs";
import * as path from "path";
import { syncMarkdownToSupabase } from "./sync-to-supabase";
import { BulkSyncOptions, BulkSyncResults } from "./types";

// Recursively find all .md files in a directory
function findMarkdownFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      findMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Process files with progress tracking
async function syncAllFiles(
  contentDir: string,
  options: BulkSyncOptions = {}
): Promise<BulkSyncResults> {
  const {
    dryRun = false,
    continueOnError = true,
    delay = 1000,
    forceUpdate = false,
  } = options;

  console.log(`🔍 Scanning for markdown files in: ${contentDir}`);

  if (!fs.existsSync(contentDir)) {
    console.error(`❌ Content directory does not exist: ${contentDir}`);
    process.exit(1);
  }

  const markdownFiles = findMarkdownFiles(contentDir);

  if (markdownFiles.length === 0) {
    console.log("📭 No markdown files found");
    return {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };
  }

  console.log(`📚 Found ${markdownFiles.length} markdown files`);
  if (forceUpdate) {
    console.log(`⚡ Force update mode enabled - will update all articles`);
  }
  console.log("");

  if (dryRun) {
    console.log("🔍 DRY RUN - Files that would be processed:");
    markdownFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    console.log("");
    console.log("To actually sync files, run without --dry-run");
    return {
      total: markdownFiles.length,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };
  }

  const results: BulkSyncResults = {
    total: markdownFiles.length,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  console.log("🚀 Starting bulk sync...");
  console.log("");

  for (let i = 0; i < markdownFiles.length; i++) {
    const file = markdownFiles[i];
    const progress = `[${i + 1}/${markdownFiles.length}]`;

    console.log(`${progress} Processing: ${file}`);

    try {
      const result = await syncMarkdownToSupabase(file, { forceUpdate });

      if (result.success) {
        switch (result.action) {
          case "created":
            results.created++;
            console.log(`   ✅ Created new article`);
            break;
          case "updated":
            results.updated++;
            console.log(`   🔄 Updated existing article`);
            break;
          case "skipped":
            results.skipped++;
            console.log(`   ⏭️  Skipped (${result.message})`);
            break;
        }
      } else {
        results.failed++;
        results.errors.push({ file, error: result.error });
        console.log(`   ❌ Failed: ${JSON.stringify(result.error)}`);

        if (!continueOnError) {
          console.log("🛑 Stopping due to error (continueOnError = false)");
          break;
        }
      }
    } catch (error) {
      results.failed++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      results.errors.push({ file, error: errorMessage });
      console.log(`   ❌ Error: ${errorMessage}`);

      if (!continueOnError) {
        console.log("🛑 Stopping due to error (continueOnError = false)");
        break;
      }
    }

    // Add delay between requests to avoid overwhelming Supabase
    if (i < markdownFiles.length - 1 && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.log(""); // Empty line for readability
  }

  // Print summary
  console.log("📊 BULK SYNC SUMMARY");
  console.log("=".repeat(50));
  console.log(`📁 Total files processed: ${results.total}`);
  console.log(`➕ Created: ${results.created}`);
  console.log(`🔄 Updated: ${results.updated}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log("");
    console.log("❌ ERRORS:");
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.file}`);
      console.log(`      Error: ${JSON.stringify(error.error)}`);
    });
  }

  console.log("");
  if (results.failed === 0) {
    console.log("🎉 All files processed successfully!");
  } else {
    console.log(
      `⚠️  Completed with ${results.failed} error(s). Check the error list above.`
    );
  }

  return results;
}

// Parse command line arguments
function parseArgs(): {
  contentDir: string;
  dryRun: boolean;
  continueOnError: boolean;
  delay: number;
  forceUpdate: boolean;
} {
  const args = process.argv.slice(2);
  const options = {
    contentDir: "./src/content",
    dryRun: false,
    continueOnError: true,
    delay: 1000,
    forceUpdate: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--force-update":
        options.forceUpdate = true;
        break;
      case "--no-continue":
        options.continueOnError = false;
        break;
      case "--delay":
        const delayValue = parseInt(args[i + 1]);
        if (!isNaN(delayValue)) {
          options.delay = delayValue;
          i++; // Skip next argument since we consumed it
        }
        break;
      case "--content-dir":
        if (args[i + 1]) {
          options.contentDir = args[i + 1];
          i++; // Skip next argument since we consumed it
        }
        break;
      case "--help":
      case "-h":
        showHelp();
        process.exit(0);
      default:
        if (!arg.startsWith("--")) {
          options.contentDir = arg;
        }
    }
  }

  return options;
}

function showHelp(): void {
  console.log("📚 Bulk Supabase Sync Tool");
  console.log("");
  console.log("Recursively finds all markdown files in the content directory");
  console.log("and syncs them to Supabase one at a time.");
  console.log("");
  console.log("Usage:");
  console.log(
    "  npm run sync:all                       # Sync all files in ./src/content"
  );
  console.log(
    "  npm run sync:all -- --dry-run          # Preview files without syncing"
  );
  console.log(
    "  npm run sync:all -- --force-update     # Force update all articles"
  );
  console.log(
    "  npm run sync:all -- --delay 2000       # 2 second delay between files"
  );
  console.log("  npm run sync:all -- --no-continue      # Stop on first error");
  console.log("");
  console.log("Options:");
  console.log("  --dry-run           Preview files that would be processed");
  console.log(
    "  --force-update      Force update even if content hasn't changed"
  );
  console.log(
    "  --delay <ms>        Delay between file processing (default: 1000ms)"
  );
  console.log("  --no-continue       Stop processing on first error");
  console.log(
    "  --content-dir <dir> Custom content directory (default: ./src/content)"
  );
  console.log("  --help, -h          Show this help message");
  console.log("");
  console.log("Examples:");
  console.log("  npm run sync:all -- --dry-run");
  console.log("  npm run sync:all -- --force-update");
  console.log("  npm run sync:all -- --delay 500");
  console.log("  npm run sync:all -- --content-dir ./my-content");
}

// Main execution
async function main(): Promise<void> {
  try {
    const options = parseArgs();

    console.log("🌍 Multilingual Bulk Supabase Sync");
    console.log("=".repeat(40));
    console.log(`📁 Content directory: ${options.contentDir}`);
    console.log(`⏱️  Delay between files: ${options.delay}ms`);
    console.log(`🔄 Continue on error: ${options.continueOnError}`);
    console.log(`👀 Dry run: ${options.dryRun}`);
    console.log(`⚡ Force update: ${options.forceUpdate}`);
    console.log("");

    await syncAllFiles(options.contentDir, options);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Unexpected error:", errorMessage);
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

export { syncAllFiles, findMarkdownFiles };
