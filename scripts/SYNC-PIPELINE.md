# Supabase Sync Pipeline

A comprehensive **multilingual** script that extracts search data from markdown files and syncs them with your Supabase database, automatically handling create/update operations and writing UUIDs back to the markdown files.

## Features

✅ **Multilingual Support** - Full support for English, Spanish, and Portuguese  
✅ **Automatic Language Detection** - Detects language from file path  
✅ **Language-Specific Stop Words** - Uses appropriate stop words for each language  
✅ **Smart Create/Update** - Creates new records or updates existing ones  
✅ **UUID Injection** - Writes Supabase UUID back to markdown frontmatter  
✅ **Change Detection** - Skips updates if content hasn't changed  
✅ **Search Data Extraction** - Leverages the improved extract-search-data.js  
✅ **Intelligent Slug Generation** - Creates slugs in format `folder/filename`

## Multilingual Support

### Supported Languages

| Language   | Code | Stop Words    | Tag Expansion       |
| ---------- | ---- | ------------- | ------------------- |
| English    | `en` | ✅ 125+ words | ✅ Tech terms       |
| Spanish    | `es` | ✅ 80+ words  | ✅ Spanish terms    |
| Portuguese | `pt` | ✅ 90+ words  | ✅ Portuguese terms |

### Language-Specific Features

**Spanish (`es`)**:

- Stop words: `el`, `la`, `de`, `que`, `y`, `en`, `es`, `se`, `no`, etc.
- Tech expansion: `blockchain` → `criptomoneda`, `web3`, `descentralizado`
- Accented character support: `ñ`, `á`, `é`, `í`, `ó`, `ú`

**Portuguese (`pt`)**:

- Stop words: `o`, `a`, `de`, `que`, `e`, `do`, `da`, `em`, `não`, etc.
- Tech expansion: `blockchain` → `criptomoeda`, `web3`, `descentralizado`
- Accented character support: `ã`, `õ`, `ç`, `á`, `é`, `í`, `ó`, `ú`

**English (`en`)**:

- Stop words: `the`, `a`, `an`, `and`, `or`, `but`, `in`, `on`, etc.
- Tech expansion: `blockchain` → `cryptocurrency`, `web3`, `decentralized`

### Example Output Differences

**English Article**:

```json
{
  "language": "en",
  "search_keywords": "blockchain cryptocurrency consensus proof work mining nodes...",
  "search_tags_expanded": "blockchain bitcoin consensus cryptocurrency web3 decentralized"
}
```

**Spanish Article**:

```json
{
  "language": "es",
  "search_keywords": "blockchain consenso prueba trabajo minería nodos bifurcación...",
  "search_tags_expanded": "blockchain bitcoin consensus criptomoneda web3 descentralizado"
}
```

**Portuguese Article**:

```json
{
  "language": "pt",
  "search_keywords": "blockchain consenso prova trabalho mineração nós bifurcação...",
  "search_tags_expanded": "blockchain bitcoin consensus criptomoeda web3 descentralizado"
}
```

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

## 🚀 Bulk Sync

The new `sync:all` script allows you to sync all markdown files across all languages in one command.

### Basic Usage

```bash
# Sync all content files (93+ files)
npm run sync:all

# Preview all files without syncing
npm run sync:all -- --dry-run

# Sync with 2-second delay between files
npm run sync:all -- --delay 2000

# Stop on first error (default: continue)
npm run sync:all -- --no-continue
```

### Language-Specific Sync

```bash
# Sync only English content
npm run sync:all -- --content-dir src/content/en

# Sync only Spanish content
npm run sync:all -- --content-dir src/content/es

# Sync only Portuguese content
npm run sync:all -- --content-dir src/content/pt
```

### Bulk Sync Features

✅ **Recursive Discovery** - Finds all `.md` files in content directory  
✅ **Progress Tracking** - Shows `[2/93] Processing: file.md`  
✅ **Rate Limiting** - Configurable delay between requests  
✅ **Error Handling** - Continue or stop on errors  
✅ **Comprehensive Summary** - Created/Updated/Skipped/Failed counts  
✅ **Error Reporting** - Lists all files that failed with reasons

### Example Bulk Sync Output

```
🌍 Multilingual Bulk Supabase Sync
========================================
📁 Content directory: ./src/content
⏱️  Delay between files: 1000ms
🔄 Continue on error: true
👀 Dry run: false

🔍 Scanning for markdown files in: ./src/content
📚 Found 93 markdown files

🚀 Starting bulk sync...

[1/93] Processing: src/content/en/blockchain-101/consensus.md
🚀 Starting sync pipeline for: src/content/en/blockchain-101/consensus.md
🌍 Detected language: en
🔗 Generated slug: blockchain-101/consensus
📊 Extracting search data...
   📊 Extracted 50 keywords
   📝 Summary: 1,234 characters
   🏷️ Headings: 6 found
   💬 Word count: 2,500 words
🔍 Checking if article exists in Supabase...
✅ Created new article: Blockchain 101: Consensus (UUID: abc-123-def)
📝 Updated markdown with Supabase ID
   ✅ Created new article

[2/93] Processing: src/content/es/blockchain-101/consenso.md
   🔄 Updated existing article

[3/93] Processing: src/content/pt/cryptography-101/where-to-start.md
   ⏭️  Skipped (Content unchanged)

...

📊 BULK SYNC SUMMARY
==================================================
📁 Total files processed: 93
➕ Created: 45
🔄 Updated: 35
⏭️  Skipped: 12
❌ Failed: 1

❌ ERRORS:
   1. src/content/es/broken-file.md
      Error: Invalid frontmatter

⚠️  Completed with 1 error(s). Check the error list above.
```

### Bulk Sync Options

| Option                | Description                   | Default         |
| --------------------- | ----------------------------- | --------------- |
| `--dry-run`           | Preview files without syncing | `false`         |
| `--delay <ms>`        | Delay between file processing | `1000ms`        |
| `--no-continue`       | Stop on first error           | Continue        |
| `--content-dir <dir>` | Custom content directory      | `./src/content` |
| `--help, -h`          | Show help message             | -               |

### Performance Considerations

- **Default Delay**: 1 second between files to avoid overwhelming Supabase
- **Error Recovery**: Continues processing even if individual files fail
- **Memory Efficient**: Processes one file at a time
- **Change Detection**: Skips files that haven't changed

### Use Cases

1. **Initial Setup**: Sync all content when setting up the database
2. **Bulk Updates**: After making changes to the extraction logic
3. **Language Migration**: Sync specific languages after translations
4. **Maintenance**: Regular syncing to ensure database is up to date

### Safety Tips

- Always run `--dry-run` first to preview what will be processed
- Use `--delay 2000` for larger batches to be gentle on Supabase
- Monitor the summary to catch any systematic issues
- Keep backups of your database before bulk operations
