# Search Data Extraction Script

This script processes markdown files and extracts search-oriented JSON data.

## Features

- Keyword extraction
- Summary extraction
- Heading hierarchy extraction
- Tag expansion by language
- Content hash generation

## Usage

### Via ts-node

```bash
ts-node --project scripts/tsconfig.json scripts/extract-search-data/index.ts <markdown-file-path> [output-file-path]
```

## Examples

```bash
# Auto-generated filename in ./search/
ts-node --project scripts/tsconfig.json scripts/extract-search-data/index.ts ./src/content/en/blockchain-101/a-primer-on-consensus.md

# Custom output path
ts-node --project scripts/tsconfig.json scripts/extract-search-data/index.ts ./src/content/es/cryptography-101/hashing.md ./output/hashing.es.json
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
