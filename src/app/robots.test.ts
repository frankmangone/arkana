import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/site-config";
import robots from "./robots";

describe("robots", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

  it("allows everything by default and points at the sitemap", () => {
    expect(rules[0].userAgent).toBe("*");
    expect(rules[0].allow).toBe("/");
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("names the AI agents it allows", () => {
    const agents = rules.flatMap((rule) => rule.userAgent ?? []);
    for (const agent of [
      "GPTBot",
      "ClaudeBot",
      "OAI-SearchBot",
      "PerplexityBot",
    ]) {
      expect(agents.includes(agent)).toBe(true);
    }
  });
});
