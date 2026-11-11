import { getPublicPosts } from "@/lib/agent-content";
import { buildRootIndex } from "@/lib/agent-content/posts-index";

export const dynamic = "force-static";

// Where an agent starts if it wants data instead of pages: the per-language
// article indexes and the other machine-readable files.
export async function GET() {
  return Response.json(buildRootIndex(await getPublicPosts()));
}
