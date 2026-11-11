import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

// AI crawlers and agents, by what they do with a page. Both groups are allowed
// today; the rules are named so each one is a decision, not an accident. To
// opt a group out, move it to `disallowed` below.
const RETRIEVAL_AGENTS = [
  // Fetch a page to answer a question, or to search, for a person
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];

const TRAINING_AGENTS = [
  // Collect pages to train models on
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

const allowed = [...RETRIEVAL_AGENTS, ...TRAINING_AGENTS];
const disallowed: string[] = [];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...(allowed.length ? [{ userAgent: allowed, allow: "/" }] : []),
      ...(disallowed.length ? [{ userAgent: disallowed, disallow: "/" }] : []),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
