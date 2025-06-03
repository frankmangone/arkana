# Supabase Sync Pipeline

A comprehensive script that extracts search data from markdown files and syncs them with your Supabase database, automatically handling create/update operations and writing UUIDs back to the markdown files.

## Features

✅ **Automatic Language Detection** - Detects language from file path  
✅ **Smart Create/Update** - Creates new records or updates existing ones  
✅ **UUID Injection** - Writes Supabase UUID back to markdown frontmatter  
✅ **Change Detection** - Skips updates if content hasn't changed  
✅ **Search Data Extraction** - Leverages the improved extract-search-data.js  
✅ **Intelligent Slug Generation** - Creates slugs in format `folder/filename`

## Prerequisites

### 1. Run Database Migration

```sql
-- Copy and execute the contents of scripts/supabase-migration.sql
-- in your Supabase SQL editor
```

### 2. Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Usage

### Basic Usage

```bash
# Using npm script
npm run sync -- ./src/content/en/blockchain-101/my-article.md

# Direct node usage
node scripts/sync-to-supabase.js ./src/content/en/blockchain-101/my-article.md
```

### Examples

```bash
# Sync English article
npm run sync -- ./src/content/en/blockchain-101/consensus.md

# Sync Spanish article
npm run sync -- ./src/content/es/cryptography-101/hashing.md

# Sync Portuguese article
npm run sync -- ./src/content/pt/blockchain-101/wrapping-up-bitcoin.md
```

## What It Does

### 1. **Language Detection** 🌍

Automatically detects language from the file path:

- `./src/content/en/...` → Language: `en`
- `./src/content/es/...` → Language: `es`
- `./src/content/pt/...` → Language: `pt`

### 2. **Slug Generation** 🔗

Creates smart slugs from file structure:

- `./src/content/en/blockchain-101/consensus.md` → Slug: `blockchain-101/consensus`
- `./src/content/es/cryptography-101/hashing.md` → Slug: `cryptography-101/hashing`

### 3. **Search Data Extraction** 📊

Uses the enhanced `extract-search-data.js` to extract:

- Clean keywords (no markdown elements)
- Smart summaries
- Heading structures
- Word counts
- Expanded tags

### 4. **Database Operations** 🗄️

- **Check Existing**: Searches for posts by slug
- **Create New**: If not found, creates new record
- **Update Existing**: If found and content changed, updates record
- **Skip Unchanged**: If content hash matches, skips update

### 5. **UUID Injection** 📝

Automatically writes the Supabase UUID back to the markdown frontmatter:

```yaml
---
title: "My Article"
author: "john-doe"
supabaseId: "f47ac10b-58cc-4372-a567-0e02b2c3d479" # ← Added automatically
---
```

## Output Examples

### Creating New Post:

```
🚀 Starting sync pipeline for: ./src/content/en/blog/new-article.md
🌍 Detected language: en
🔗 Generated slug: blog/new-article
📊 Extracting search data...
   📊 Extracted 50 keywords
   📝 Summary: 1,234 characters
   🏷️ Headings: 6 found
   💬 Word count: 2,500 words
🔍 Checking if post exists in Supabase...
➕ Post not found, creating new record...
✅ Created new post: My New Article (ID: f47ac10b-58cc-4372-a567-0e02b2c3d479)
📝 Updated ./src/content/en/blog/new-article.md with Supabase ID: f47ac10b-58cc-4372-a567-0e02b2c3d479

🎉 Sync completed successfully!
   Action: created
   UUID: f47ac10b-58cc-4372-a567-0e02b2c3d479
   Title: My New Article
```

### Updating Existing Post:

```
🚀 Starting sync pipeline for: ./src/content/en/blog/existing-article.md
🌍 Detected language: en
🔗 Generated slug: blog/existing-article
📊 Extracting search data...
   📊 Extracted 48 keywords
   📝 Summary: 1,156 characters
   🏷️ Headings: 4 found
   💬 Word count: 2,200 words
🔍 Checking if post exists in Supabase...
📄 Found existing post: My Existing Article (ID: a1b2c3d4-5678-90ab-cdef-1234567890ab)
🔄 Updating existing post...
✅ Updated existing post: My Existing Article (ID: a1b2c3d4-5678-90ab-cdef-1234567890ab)
📝 Updated ./src/content/en/blog/existing-article.md with Supabase ID: a1b2c3d4-5678-90ab-cdef-1234567890ab

🎉 Sync completed successfully!
   Action: updated
   UUID: a1b2c3d4-5678-90ab-cdef-1234567890ab
   Title: My Existing Article
```

### Skipping Unchanged Content:

```
🚀 Starting sync pipeline for: ./src/content/en/blog/unchanged-article.md
🌍 Detected language: en
🔗 Generated slug: blog/unchanged-article
📊 Extracting search data...
   📊 Extracted 45 keywords
   📝 Summary: 987 characters
   🏷️ Headings: 3 found
   💬 Word count: 1,800 words
🔍 Checking if post exists in Supabase...
📄 Found existing post: My Unchanged Article (ID: x1y2z3a4-5678-90bc-def1-234567890xyz)
⏭️ Content unchanged, skipping update

🎉 Sync completed successfully!
   Action: skipped
   UUID: x1y2z3a4-5678-90bc-def1-234567890xyz
   Title: My Unchanged Article
   Reason: Content unchanged
```

## Database Fields Updated

The script populates these Supabase fields:

| Field                  | Source      | Description                   |
| ---------------------- | ----------- | ----------------------------- |
| `title`                | Frontmatter | Article title                 |
| `content`              | Generated   | Summary as content preview    |
| `slug`                 | Path-based  | `folder/filename` format      |
| `author`               | Frontmatter | Author identifier             |
| `tags`                 | Frontmatter | Original tags array           |
| `date`                 | Frontmatter | Publication date              |
| `description`          | Frontmatter | Meta description              |
| `reading_time`         | Calculated  | Based on word count (200 WPM) |
| `word_count`           | Extracted   | Actual word count             |
| `headings_structure`   | Extracted   | JSON array of headings        |
| `search_keywords`      | Extracted   | Clean, filtered keywords      |
| `search_summary`       | Extracted   | Smart summary                 |
| `search_tags_expanded` | Extracted   | Original + related tags       |
| `content_hash`         | Extracted   | MD5 for change detection      |

## Error Handling

The script gracefully handles:

- ✅ **Missing files** - Clear error messages
- ✅ **Invalid frontmatter** - Extraction errors
- ✅ **Database connection issues** - Network error handling
- ✅ **Duplicate entries** - Finds by slug and updates
- ✅ **Permission errors** - Clear Supabase error messages

## Integration with Your Workflow

### For Individual Articles

```bash
# After writing a new article
npm run sync -- ./src/content/en/blog/my-new-post.md

# After editing an existing article
npm run sync -- ./src/content/en/blog/my-edited-post.md
```

### For Batch Processing

Create a simple batch script:

```bash
#!/bin/bash
# sync-all.sh

for file in src/content/en/**/*.md; do
  echo "Syncing: $file"
  npm run sync -- "$file"
done
```

### VS Code Integration

Add to your VS Code tasks.json:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Sync to Supabase",
      "type": "shell",
      "command": "npm",
      "args": ["run", "sync", "--", "${file}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**

   - Check your `.env` file
   - Ensure both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

2. **"Failed to extract data"**

   - Check markdown file format
   - Ensure frontmatter is valid YAML
   - Check file permissions

3. **"Error creating/updating post"**

   - Verify Supabase permissions
   - Check if the posts table exists
   - Run the migration SQL first

4. **"Permission denied"**
   - Ensure service role key has proper permissions
   - Check RLS policies if enabled

### Debugging

Check the generated JSON files in `./search/` to debug extraction issues:

```bash
# Generate search data without syncing
npm run build:search -- ./src/content/en/blog/problematic-file.md

# Check the output
cat ./search/blog.problematic-file.en.json
```

## Performance

- **Change Detection**: Only processes files when content actually changes
- **Efficient Extraction**: Reuses the optimized extract-search-data.js
- **Smart Updates**: Skips unnecessary database operations
- **Memory Efficient**: Processes one file at a time
