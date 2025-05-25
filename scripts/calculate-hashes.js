#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const matter = require("gray-matter");

// Function to walk through content directories
function processDirectory(dir) {
  console.log(`Processing directory: ${dir}`);

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith(".md")) {
      processMarkdownFile(fullPath);
    }
  }
}

// Function to process each markdown file
function processMarkdownFile(filePath) {
  console.log(`Processing file: ${filePath}`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Parse frontmatter and content
    const { data, content } = matter(fileContent);

    // Calculate hash from content
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    // Add hash to frontmatter
    data.contentHash = hash;

    // Reconstruct the file with updated frontmatter
    const updatedFileContent = matter.stringify(content, data);

    // Write back to file
    fs.writeFileSync(filePath, updatedFileContent);
    console.log(`  ✅ Hash added: ${hash.substring(0, 8)}...`);
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

// Utility function to count the number of processed files
function countMarkdownFiles(dir) {
  let count = 0;

  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith(".md")) {
        count++;
      }
    }
  }

  walkDir(dir);
  return count;
}

// Start processing from content directory
const contentDir = path.join(process.cwd(), "src", "content");

console.log("🔍 Starting content hash calculation");
console.log(
  `Found ${countMarkdownFiles(contentDir)} markdown files to process`
);

const startTime = Date.now();
processDirectory(contentDir);
const endTime = Date.now();

console.log("✨ Content hash calculation complete");
console.log(
  `⏱️  Process took ${((endTime - startTime) / 1000).toFixed(2)} seconds`
);
