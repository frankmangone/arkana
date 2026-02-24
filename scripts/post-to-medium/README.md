# Post to Medium

CLI utility to create a Medium draft from a local markdown file.

## What it does

- Reads markdown from disk
- Extracts title from frontmatter or first `#` heading (or `--title`)
- Converts markdown into paragraph deltas
- Preserves `<figure><img ... /></figure>` blocks and transforms them at runtime
- Uploads each figure image to Medium before creating the draft
- Converts block LaTeX (`$$ ... $$`) into generated PNG images and uploads them
- Converts inline LaTeX (`$...$`) to unicode when possible (falls back to raw expression)
- Sends a draft creation request to Medium's internal draft endpoint
- Supports `--dry-run` to inspect payload without sending

## Requirements

Set environment variables before running:

```bash
export MEDIUM_COOKIE='...'
export MEDIUM_XSRF_TOKEN='...'
# Optional tuning:
# export MEDIUM_UPLOAD_ENDPOINT='https://medium.com/_/upload'
# export MEDIUM_UPLOAD_FIELD='image'
# export MEDIUM_IMAGE_PARAGRAPH_TYPE='4'
```

## Usage from frontend root

```bash
npm run post:medium -- --file ./src/content/en/blockchain-101/ethereum.md --dry-run
```

Real request:

```bash
npm run post:medium -- --file ./src/content/en/blockchain-101/ethereum.md --visibility draft
```

## Options

- `-f, --file <path>`: markdown input file (required)
- `-t, --title <title>`: override detected title
- `-v, --visibility <draft|unlisted|public|0|1|2>`: post visibility (default: `draft`)
- `--coverless`: create coverless draft (default)
- `--with-cover`: create draft with cover
- `--dry-run`: print payload preview only
- `-h, --help`: print help

## Notes

- This relies on an internal Medium endpoint and may break if Medium changes its API.
- Use a draft visibility first while testing.
