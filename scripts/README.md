# Search Data Extraction Script

This script processes markdown files and extracts search-optimized data for efficient indexing and retrieval.

## Features

- **Keyword Extraction**: Extracts top 50 keywords with frequency-based weighting
- **Smart Summary**: Combines introduction, conclusion, and key middle paragraphs
- **Heading Structure**: Extracts all headings with hierarchy information
- **Tag Expansion**: Automatically adds related terms based on content
- **Content Cleaning**: Removes markdown syntax for clean text processing
- **Change Detection**: Generates content hash for tracking modifications

## Usage

### Using npm script (Recommended)

```bash
npm run extract-search -- <markdown-file-path> [output-file-path]
```

### Direct Node.js usage

```bash
node scripts/extract-search-data.js <markdown-file-path> [output-file-path]
```

### Examples

```bash
# Using npm script - Process a single file (outputs to ./search/ directory)
npm run extract-search -- ./src/content/en/blog/my-article.md

# Using npm script - Process with custom output location
npm run extract-search -- ./src/content/en/blog/ethereum-guide.md ./output/ethereum-search-data.json

# Using npm script - Process with Supabase ID for pipeline integration
npm run extract-search -- ./src/content/en/blog/my-article.md ./search/my-article.json f47ac10b-58cc-4372-a567-0e02b2c3d479

# Using npm script - Process Spanish content
npm run extract-search -- ./src/content/es/blog/guia-ethereum.md

# Direct node usage (alternative) - defaults to ./search/ directory
node scripts/extract-search-data.js ./src/content/en/blog/my-article.md

# Process with custom output location
node scripts/extract-search-data.js ./src/content/en/blog/ethereum-guide.md ./output/ethereum-search-data.json

# Process with Supabase ID for database updates
node scripts/extract-search-data.js ./src/content/en/blog/my-article.md ./search/my-article.json abc-123-def
```

## Output Directory

By default, all extracted search data is saved to the `./search/` directory, which is gitignored to keep the repository clean. The directory will be created automatically if it doesn't exist.

### Automatic Filename Generation

The script automatically generates structured filenames using the pattern: `folder.filename.lang.json`

**Examples:**

- `src/content/en/blockchain-101/a-primer-on-consensus.md` → `blockchain-101.a-primer-on-consensus.en.json`
- `src/content/es/cryptography-101/hashing.md` → `cryptography-101.hashing.es.json`
- `src/content/pt/blockchain-101/wrapping-up-bitcoin.md` → `blockchain-101.wrapping-up-bitcoin.pt.json`

You can override the output location by providing a custom path as the second argument.

## Output Format

The script generates a JSON file with the following structure:

```json
{
  "title": "Article Title",
  "author": "Author Name",
  "date": "2025-01-01",
  "description": "Article description",
  "tags": ["tag1", "tag2"],

  "search_keywords": "blockchain ethereum smart-contracts defi...",
  "search_summary": "Introduction paragraph...\n\nConclusion paragraph...",
  "search_headings": "Getting Started Understanding Blockchain Implementation...",
  "search_tags_expanded": "blockchain ethereum cryptocurrency web3 defi smart-contracts...",

  "headings_structure": [
    { "level": 1, "text": "Getting Started", "slug": "getting-started" },
    {
      "level": 2,
      "text": "Understanding Blockchain",
      "slug": "understanding-blockchain"
    }
  ],
  "word_count": 1250,
  "content_hash": "abc123def456...",
  "processed_at": "2025-01-14T10:30:00.000Z",
  "source_file": "my-article.md"
}
```

## Processing Logic

### Keyword Extraction

- **Weighting**: Title (3x), Headings (2x), Content (1x)
- **Filtering**: Removes stop words, numbers, single letters
- **Frequency**: Sorts by occurrence frequency
- **Limit**: Returns top 50 keywords

### Summary Generation

- **Introduction**: First substantial paragraph
- **Conclusion**: Last substantial paragraph
- **Middle**: One paragraph from middle (if article is long)
- **Length**: Limited to ~300 words

### Tag Expansion

Automatically adds related terms:

- `blockchain/crypto` → adds `cryptocurrency`, `web3`, `decentralized`
- `ethereum` → adds `smart-contracts`, `defi`, `blockchain`
- `javascript/typescript` → adds `programming`, `web-development`, `coding`

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Extract Search Data
on:
  push:
    paths: ["src/content/**/*.md"]

jobs:
  extract-search-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install gray-matter

      - name: Extract search data
        run: |
          for file in src/content/**/*.md; do
            node scripts/extract-search-data.js "$file" "search-data/$(basename "$file" .md).json"
          done

      - name: Upload search data
        # Upload to your database or storage
```

### Batch Processing Script

```bash
#!/bin/bash
# Process all markdown files in content directory

for file in src/content/**/*.md; do
  echo "Processing: $file"
  node scripts/extract-search-data.js "$file" "output/$(basename "$file" .md).json"
done

echo "✅ All files processed!"
```

## Requirements

- Node.js 14+
- `gray-matter` package (install with `npm install gray-matter`)

## Output Statistics

The script provides helpful statistics:

- Number of keywords extracted
- Summary character count
- Number of headings found
- Total word count

Perfect for monitoring content processing and ensuring quality extraction!
