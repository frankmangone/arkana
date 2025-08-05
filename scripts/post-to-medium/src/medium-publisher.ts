import puppeteer, { Browser, Page, HTTPRequest, HTTPResponse } from "puppeteer";
import axios, { AxiosResponse } from "axios";
import * as fs from "fs";
import * as path from "path";
import {
  MediumCookie,
  MediumHeaders,
  MediumUser,
  MediumPublisherConfig,
  CapturedRequest,
  CapturedResponse,
  GraphQLResponse,
} from "./types";

export class MediumPublisher {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private cookies: MediumCookie[] = [];
  private headers: MediumHeaders | null = null;
  private capturedRequests: CapturedRequest[] = [];
  private capturedResponses: CapturedResponse[] = [];
  private config: MediumPublisherConfig;

  constructor(config: Partial<MediumPublisherConfig> = {}) {
    this.config = {
      headless: false,
      devtools: true,
      timeout: 30000,
      captureRequests: true,
      outputDir: "./output",
      ...config,
    };

    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  async init(): Promise<void> {
    console.log("🚀 Starting browser...");

    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      devtools: this.config.devtools,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    this.page = await this.browser.newPage();

    if (this.config.captureRequests) {
      await this.setupRequestInterception();
    }

    // Navigate to Medium
    console.log("📖 Opening Medium...");
    await this.page.goto("https://medium.com", {
      waitUntil: "networkidle2",
      timeout: this.config.timeout,
    });
  }

  private setupRequestInterception(): void {
    if (!this.page) return;

    this.page.setRequestInterception(true);

    this.page.on("request", (request: HTTPRequest) => {
      const url = request.url();

      // Log interesting requests
      if (this.isInterestingRequest(url)) {
        const capturedRequest: CapturedRequest = {
          method: request.method(),
          url: url,
          headers: request.headers(),
          postData: request.postData(),
          timestamp: new Date(),
        };

        this.capturedRequests.push(capturedRequest);

        console.log("🔍 Interesting request:", {
          method: request.method(),
          url: url,
          headers: request.headers(),
          postData: request.postData()?.substring(0, 200) + "...",
        });
      }

      request.continue();
    });

    this.page.on("response", async (response: HTTPResponse) => {
      const url = response.url();

      // Capture responses from Medium's internal APIs
      if (this.isInterestingRequest(url)) {
        try {
          const responseBody = await response.text();
          const capturedResponse: CapturedResponse = {
            url: url,
            status: response.status(),
            headers: response.headers(),
            body: responseBody,
            timestamp: new Date(),
          };

          this.capturedResponses.push(capturedResponse);

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

  private isInterestingRequest(url: string): boolean {
    return (
      url.includes("/_/") ||
      url.includes("/graphql") ||
      url.includes("deltas") ||
      url.includes("batch") ||
      url.includes("/p/") ||
      url.includes("/drafts/")
    );
  }

  async waitForLogin(): Promise<void> {
    console.log("🔐 Please log in to Medium manually in the browser...");
    console.log('   1. Click "Sign in" in the browser');
    console.log("   2. Log in with your credentials");
    console.log("   3. Wait for the dashboard to load");
    console.log("   4. Press ENTER in this terminal when ready");

    // Wait for user input
    await new Promise<void>((resolve) => {
      process.stdin.once("data", () => resolve());
    });

    console.log("✅ Continuing...");
  }

  async captureCredentials(): Promise<MediumHeaders> {
    console.log("🍪 Capturing cookies and session data...");

    if (!this.page) {
      throw new Error("Page not initialized");
    }

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

    const userAgent = await this.page.evaluate(
      () => (window as any).navigator.userAgent
    );

    this.headers = {
      Cookie: cookieString,
      "User-Agent": userAgent,
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

  async createDraftAndTest(): Promise<void> {
    console.log("📝 Creating a new draft to test...");
    console.log('   1. Click "Write" in Medium');
    console.log("   2. Start typing something");
    console.log("   3. Watch the console for API calls");
    console.log("   4. Press ENTER when you want to continue");

    await new Promise<void>((resolve) => {
      process.stdin.once("data", () => resolve());
    });
  }

  async testAPICall(): Promise<boolean> {
    console.log("🧪 Testing API call with captured credentials...");

    if (!this.headers) {
      console.log("❌ No headers available. Please capture credentials first.");
      return false;
    }

    try {
      // Try to make a test request to Medium's GraphQL endpoint
      const response: AxiosResponse<GraphQLResponse<{ viewer: MediumUser }>> =
        await axios.post(
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
            headers: this.headers as Record<string, string>,
            timeout: 10000,
          }
        );

      if (response.data.errors) {
        console.log("❌ GraphQL errors:", response.data.errors);
        return false;
      }

      console.log("✅ GraphQL test successful!", response.data.data);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          "❌ GraphQL test failed:",
          error.response?.status,
          error.response?.data || error.message
        );
      } else {
        console.log("❌ GraphQL test failed:", error);
      }
      return false;
    }
  }

  async saveCapturedData(): Promise<void> {
    console.log("💾 Saving captured data...");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Save captured requests
    if (this.capturedRequests.length > 0) {
      const requestsPath = path.join(
        this.config.outputDir,
        `requests-${timestamp}.json`
      );
      fs.writeFileSync(
        requestsPath,
        JSON.stringify(this.capturedRequests, null, 2)
      );
      console.log(
        `📄 Saved ${this.capturedRequests.length} requests to ${requestsPath}`
      );
    }

    // Save captured responses
    if (this.capturedResponses.length > 0) {
      const responsesPath = path.join(
        this.config.outputDir,
        `responses-${timestamp}.json`
      );
      fs.writeFileSync(
        responsesPath,
        JSON.stringify(this.capturedResponses, null, 2)
      );
      console.log(
        `📄 Saved ${this.capturedResponses.length} responses to ${responsesPath}`
      );
    }

    // Save cookies and headers
    const credentialsPath = path.join(
      this.config.outputDir,
      `credentials-${timestamp}.json`
    );
    fs.writeFileSync(
      credentialsPath,
      JSON.stringify(
        {
          cookies: this.cookies,
          headers: this.headers,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(`🔐 Saved credentials to ${credentialsPath}`);
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      console.log("🧹 Cleaning up...");
      await this.browser.close();
    }
  }

  // Getter methods for accessing captured data
  getCapturedRequests(): CapturedRequest[] {
    return [...this.capturedRequests];
  }

  getCapturedResponses(): CapturedResponse[] {
    return [...this.capturedResponses];
  }

  getHeaders(): MediumHeaders | null {
    return this.headers;
  }

  getCookies(): MediumCookie[] {
    return [...this.cookies];
  }
}
