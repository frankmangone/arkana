import axios from "axios";

// Configuration - Extract these from your browser's dev tools
const MEDIUM_COOKIE =
  "nonce=S6aHrQcQ; uid=52f727507bbd; _ga_L0TFYZVE5F=GS1.2.1738162322.2.0.1738162322.0.0.0; sid=1:xPHG2OSIltiz0M9DFzbr9L7PpHYbmGHIRy792AjxVR6sqdGZxvUic3EgpRSPadd5; tz=180; _gcl_au=1.1.1876491419.1748823975.1697655644.1753708062.1753708066; _gid=GA1.2.404806218.1754232181; xsrf=b1c520444e2f; _cfuvid=Ll7uNQEgi5c1dgG4Wq5RB.DsosDTOl7SUMuu27Aqi3E-1754446274659-0.0.1.1-604800000; sz=1470; pr=2; cf_clearance=cIFoRH3okzwaxp_dO7FU4uX1RbIGvumjl32zeU2eVQU-1754447232-1.2.1.1-8ypq0UJSFbcAWqgo.hbomEDNm8P7hwq3lBDwyaNQseyJ3qk5y6980INHvp_zRpZTAoRwrtBbjI8gQi2BzKTaUF78LgIAHxbLwjSzfBTA7SaDWjXwtM6pdA8w4LuRxPFk.Dduf7voZn8AxiZBhFI6zcoQ.0mxbEkrEud_kyq_LlLaBb5tWTsVXBiaBgExcB9HRYor5kOD9xp9AgNtLqwGffkR09IRZhn5CGycFKrB5h4; _ga=GA1.1.2102446593.1729768225; _ga_7JY7T788PK=GS2.1.s1754446384$o528$g1$t1754447559$j60$l0$h0; _dd_s=rum=0&expire=1754448459600";
const XSRF_TOKEN = "b1c520444e2f"; // Extract from xsrf= in cookie

interface MediumDraftOptions {
  title?: string;
  content?: string;
  visibility?: number; // 0 = draft, 1 = unlisted, 2 = public
  coverless?: boolean;
}

interface MediumDraftResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

class MediumDraftCreator {
  private headers: Record<string, string>;

  constructor(cookie: string, xsrfToken: string) {
    this.headers = {
      Cookie: cookie,
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Content-Type": "application/json",
      Accept: "application/json",
      Referer: "https://medium.com/new-story",
      Origin: "https://medium.com",
      "X-Obvious-Csrf": xsrfToken,
      "X-Xsrf-Token": xsrfToken,
      "X-Requested-With": "XMLHttpRequest",
    };
  }

  /**
   * Create a new draft on Medium
   */
  async createDraft(
    options: MediumDraftOptions = {}
  ): Promise<MediumDraftResponse> {
    try {
      // Generate a unique logLockId for this draft creation
      const logLockId = Math.floor(Math.random() * 100000);

      const draftData = {
        baseRev: -1,
        coverless: options.coverless ?? true,
        deltas: [], // TODO: Convert content to Medium's delta format
        visibility: options.visibility ?? 0, // Default to draft
      };

      console.log(`📝 Creating Medium draft with logLockId: ${logLockId}`);

      const response = await axios.post(
        `https://medium.com/new-story?logLockId=${logLockId}`,
        draftData,
        {
          headers: this.headers,
          timeout: 10000,
        }
      );

      console.log("✅ Draft created successfully!");

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("❌ Failed to create draft:", error.response?.status);
        console.log("Error details:", error.response?.data);

        return {
          success: false,
          error: `HTTP ${error.response?.status}: ${error.response?.statusText}`,
        };
      } else {
        console.log("❌ Unexpected error:", error);
        return {
          success: false,
          error: String(error),
        };
      }
    }
  }
}

// Example usage
async function main(): Promise<void> {
  console.log("🎯 Medium Draft Creator");
  console.log("=======================");

  const creator = new MediumDraftCreator(MEDIUM_COOKIE, XSRF_TOKEN);

  try {
    const result = await creator.createDraft({
      visibility: 0, // Draft mode
      coverless: true,
    });

    if (result.success) {
      console.log("\n🎉 Success! Draft created.");
      console.log("Next steps:");
      console.log("1. Add content conversion (markdown to deltas)");
      console.log("2. Add title and content support");
      console.log("3. Add publishing functionality");
    } else {
      console.log("\n❌ Failed:", result.error);
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}
