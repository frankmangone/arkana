# Medium Publisher POC - Complete Specification

A proof-of-concept tool to reverse engineer Medium's internal APIs for automated publishing from markdown files.

## Project Structure

```
medium-publisher-poc/
├── package.json
├── index.js
├── README.md
└── test-content.md
```

## Files

### `package.json`

```json
{
  "name": "medium-publisher-poc",
  "version": "1.0.0",
  "description": "POC for automated Medium publishing via internal APIs",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "puppeteer": "^21.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  },
  "keywords": ["medium", "automation", "publishing"],
  "author": "Your Name",
  "license": "MIT"
}
```

### `index.js`

```javascript
const puppeteer = require("puppeteer");
const axios = require("axios");

class MediumPublisher {
  constructor() {
    this.browser = null;
    this.page = null;
    this.cookies = null;
    this.csrfToken = null;
    this.headers = {};
  }

  async init() {
    console.log("🚀 Starting browser...");
    this.browser = await puppeteer.launch({
      headless: false, // We want to see the browser for login
      devtools: true, // Open dev tools automatically
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    this.page = await this.browser.newPage();

    // Set up request interception to capture API calls
    await this.page.setRequestInterception(true);
    this.setupRequestInterception();

    // Navigate to Medium
    console.log("📖 Opening Medium...");
    await this.page.goto("https://medium.com", { waitUntil: "networkidle2" });
  }

  setupRequestInterception() {
    this.page.on("request", (request) => {
      const url = request.url();

      // Log interesting requests
      if (
        url.includes("/_/") ||
        url.includes("/graphql") ||
        url.includes("deltas") ||
        url.includes("batch")
      ) {
        console.log("🔍 Interesting request:", {
          method: request.method(),
          url: url,
          headers: request.headers(),
          postData: request.postData(),
        });
      }

      request.continue();
    });

    this.page.on("response", async (response) => {
      const url = response.url();

      // Capture responses from Medium's internal APIs
      if (
        url.includes("/_/") ||
        url.includes("/graphql") ||
        url.includes("deltas") ||
        url.includes("batch")
      ) {
        try {
          const responseBody = await response.text();
          console.log("📥 API Response:", {
            url: url,
            status: response.status(),
            headers: response.headers(),
            body:
              responseBody.substring(0, 500) +
              (responseBody.length > 500 ? "..." : ""),
          });
        } catch (error) {
          console.log("❌ Could not capture response body for:", url);
        }
      }
    });
  }

  async waitForLogin() {
    console.log("🔐 Please log in to Medium manually in the browser...");
    console.log('   1. Click "Sign in" in the browser');
    console.log("   2. Log in with your credentials");
    console.log("   3. Wait for the dashboard to load");
    console.log("   4. Press ENTER in this terminal when ready");

    // Wait for user input
    await new Promise((resolve) => {
      process.stdin.once("data", () => resolve());
    });

    console.log("✅ Continuing...");
  }

  async captureCredentials() {
    console.log("🍪 Capturing cookies and session data...");

    // Get all cookies
    this.cookies = await this.page.cookies();

    // Extract important session cookies
    const sessionCookies = this.cookies.filter(
      (cookie) =>
        cookie.name.includes("sid") ||
        cookie.name.includes("session") ||
        cookie.name.includes("uid") ||
        cookie.name.includes("_ga") ||
        cookie.name.includes("lightstep")
    );

    console.log(
      "🔑 Found session cookies:",
      sessionCookies.map((c) => c.name)
    );

    // Build cookie string for HTTP requests
    const cookieString = this.cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    this.headers = {
      Cookie: cookieString,
      "User-Agent": await this.page.evaluate(() => navigator.userAgent),
      Referer: "https://medium.com/",
      Origin: "https://medium.com",
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
    };

    console.log("✅ Headers prepared for API calls");
    return this.headers;
  }

  async createDraftAndTest() {
    console.log("📝 Creating a new draft to test...");
    console.log('   1. Click "Write" in Medium');
    console.log("   2. Start typing something");
    console.log("   3. Watch the console for API calls");
    console.log("   4. Press ENTER when you want to continue");

    await new Promise((resolve) => {
      process.stdin.once("data", () => resolve());
    });
  }

  async testAPICall(testText = "Hello from automation!") {
    console.log("🧪 Testing API call with captured credentials...");

    try {
      // Try to make a test request to Medium's GraphQL endpoint
      const response = await axios.post(
        "https://medium.com/_/graphql",
        {
          query: `
          query {
            viewer {
              id
              name
              username
            }
          }
        `,
        },
        {
          headers: this.headers,
          timeout: 10000,
        }
      );

      console.log("✅ GraphQL test successful!", response.data);
      return true;
    } catch (error) {
      console.log(
        "❌ GraphQL test failed:",
        error.response?.status,
        error.response?.data || error.message
      );
      return false;
    }
  }

  async cleanup() {
    if (this.browser) {
      console.log("🧹 Cleaning up...");
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const publisher = new MediumPublisher();

  try {
    await publisher.init();
    await publisher.waitForLogin();
    await publisher.captureCredentials();
    await publisher.createDraftAndTest();
    await publisher.testAPICall();

    console.log(
      "🎉 POC completed! Check the console output for captured API calls."
    );
    console.log("📋 Next steps:");
    console.log("   1. Analyze the captured deltas/batch operations");
    console.log("   2. Reverse engineer the draft creation endpoint");
    console.log("   3. Build the markdown-to-deltas converter");
  } catch (error) {
    console.error("💥 Error:", error);
  } finally {
    await publisher.cleanup();
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

if (require.main === module) {
  main();
}
```

### `test-content.md`

````markdown
# My Test Article

This is a test article to see how Medium handles different markdown elements.

## Introduction

Medium is a popular blogging platform, and we're trying to automate publishing to it.

### Key Features

- Rich text editing
- Real-time collaboration
- Social features

## Code Example

Here's some JavaScript:

```javascript
function hello() {
  console.log("Hello, Medium!");
}
```
````

## Conclusion

This automation will help streamline our publishing workflow.

**Bold text** and _italic text_ should work too.

[Link to Google](https://google.com)

````

### `README.md`

```markdown
# Medium Publisher POC

A proof-of-concept tool to reverse engineer Medium's internal APIs for automated publishing.

## Setup

1. **Create the project directory:**
   ```bash
   mkdir medium-publisher-poc
   cd medium-publisher-poc
````

2. **Initialize and install dependencies:**

   ```bash
   npm init -y
   npm install puppeteer axios
   npm install --save-dev nodemon
   ```

3. **Copy the files from this specification**

4. **Run the POC:**
   ```bash
   npm start
   ```

## How It Works

1. **Opens Chrome** with dev tools enabled
2. **Waits for manual login** - you log in through the browser
3. **Captures session cookies** and builds HTTP headers
4. **Monitors network requests** to capture Medium's internal API calls
5. **Tests authentication** with a GraphQL query

## What to Watch For

When you start typing in Medium's editor, look for:

- **`/_/deltas`** endpoints - Real-time document updates
- **`/_/batch`** endpoints - Grouped operations
- **GraphQL mutations** - For creating/publishing posts
- **Request payloads** - The delta format and structure

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

## Next Development Steps

1. **Phase 1: API Discovery**

   - Run this POC
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

## Troubleshooting

- **Puppeteer install issues**: Try `npm install puppeteer --unsafe-perm=true`
- **Chrome not found**: Install Chrome or set `PUPPETEER_EXECUTABLE_PATH`
- **Network requests not captured**: Make sure dev tools are open in the browser
- **Authentication fails**: Re-run the credential capture step

````

## Usage Instructions

1. **Copy this entire specification** into Cursor
2. **Create the project structure** as outlined above
3. **Run the setup commands**:
   ```bash
   mkdir medium-publisher-poc && cd medium-publisher-poc
   npm init -y
   npm install puppeteer axios
````

4. **Create each file** with the content provided
5. **Start experimenting**:
   ```bash
   npm start
   ```

## Expected Research Outcomes

After running this POC, you should have:

- ✅ Complete understanding of Medium's delta format
- ✅ Authentication headers and cookies
- ✅ API endpoints for draft creation and publishing
- ✅ Request/response examples for all operations
- ✅ Foundation for building a markdown-to-Medium converter

This specification gives you everything needed to start reverse engineering Medium's internal APIs in Cursor!
