# Medium API Exploration Tool

A TypeScript-based tool to explore Medium's internal APIs for automated publishing from markdown files.

## Setup

1. **Navigate to the script directory:**

   ```bash
   cd scripts/post-to-medium
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the TypeScript code:**
   ```bash
   npm run build
   ```

## Usage

### Development Mode (Recommended for exploration)

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Watch Mode (Auto-restart on changes)

```bash
npm run watch
```

## How It Works

1. **Opens Chrome** with dev tools enabled
2. **Waits for manual login** - you log in through the browser
3. **Captures session cookies** and builds HTTP headers
4. **Monitors network requests** to capture Medium's internal API calls
5. **Tests authentication** with a GraphQL query
6. **Saves captured data** to the `output/` directory

## What to Watch For

When you start typing in Medium's editor, look for:

- **`/_/deltas`** endpoints - Real-time document updates
- **`/_/batch`** endpoints - Grouped operations
- **GraphQL mutations** - For creating/publishing posts
- **Request payloads** - The delta format and structure

## Output Files

The tool creates several files in the `output/` directory:

- `requests-{timestamp}.json` - Captured API requests
- `responses-{timestamp}.json` - Captured API responses
- `credentials-{timestamp}.json` - Session cookies and headers

## Expected API Discoveries

Based on reverse engineering, we expect to find:

### 1. Draft Creation

```javascript
// Likely endpoint: POST /p/new or similar
{
  "title": "",
  "content": "",
  "tags": []
}
```

### 2. Delta Operations

```javascript
// Endpoint: /_/deltas or /_/batch
{
  "baseRev": 126,
  "deltas": [
    {
      "type": 3,
      "index": 7,
      "paragraph": {
        "name": "2d02",
        "type": 1,
        "text": "content here",
        "markups": []
      }
    }
  ]
}
```

### 3. Publishing

```javascript
// Likely GraphQL mutation
mutation PublishPost($postId: ID!) {
  publishPost(postId: $postId) {
    id
    url
    publishedAt
  }
}
```

## Configuration

You can customize the behavior by modifying the configuration in `src/index.ts`:

```typescript
const publisher = new MediumPublisher({
  headless: false, // Show browser window
  devtools: true, // Open dev tools
  timeout: 30000, // Page load timeout
  captureRequests: true, // Capture network requests
  outputDir: "./output", // Output directory
});
```

## Troubleshooting

- **Puppeteer install issues**: Try `npm install puppeteer --unsafe-perm=true`
- **Chrome not found**: Install Chrome or set `PUPPETEER_EXECUTABLE_PATH`
- **Network requests not captured**: Make sure dev tools are open in the browser
- **Authentication fails**: Re-run the credential capture step

## Next Steps

1. **Phase 1: API Discovery** ✅

   - Run this tool
   - Capture all API calls
   - Document the request/response formats

2. **Phase 2: Format Understanding**

   - Understand the delta format
   - Map markdown elements to Medium's structure
   - Build conversion functions

3. **Phase 3: Automation**

   - Create markdown-to-delta converter
   - Build automated publishing pipeline
   - Add error handling and retry logic

4. **Phase 4: Integration**
   - Connect to your blog's markdown files
   - Add scheduling and batch processing
   - Create a CLI tool

## Important Notes

- This is for educational/personal use only
- Respect Medium's terms of service
- Don't abuse the APIs or you may get rate-limited/banned
- The internal APIs may change without notice
- Always test with drafts first

## Project Structure

```
scripts/post-to-medium/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts              # Main entry point
│   ├── medium-publisher.ts   # Core publisher class
│   └── types.ts              # TypeScript type definitions
└── output/                   # Generated output files
```
