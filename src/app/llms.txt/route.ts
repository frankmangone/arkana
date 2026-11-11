import { getPublicPosts } from "@/lib/agent-content";
import { buildLlmsTxt } from "@/lib/agent-content/llms-txt";

export const dynamic = "force-static";

export async function GET() {
  return new Response(buildLlmsTxt(await getPublicPosts()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
