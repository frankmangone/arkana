# Search Data Extraction Script

This script processes markdown files and extracts search-oriented JSON data.

## Features

- Keyword extraction
- Summary extraction
- Heading hierarchy extraction
- Tag expansion by language
- Content hash generation

## Usage

### Via npm (recommended)

```bash
npm run build:search -- <markdown-file-path> [output-file-path]
```

### Via ts-node

```bash
ts-node --project scripts/tsconfig.json scripts/extract-search-data/index.ts <markdown-file-path> [output-file-path]
```

## Examples

```bash
# Auto-generated filename in ./search/
npm run build:search -- ./src/content/en/blockchain-101/a-primer-on-consensus.md

# Custom output path
npm run build:search -- ./src/content/es/cryptography-101/hashing.md ./output/hashing.es.json
```

## Output

Default output directory: `./search/`.

Generated filename pattern:

```text
folder.filename.lang.json
```

Example:

```text
src/content/en/blockchain-101/a-primer-on-consensus.md
-> search/blockchain-101.a-primer-on-consensus.en.json
```
