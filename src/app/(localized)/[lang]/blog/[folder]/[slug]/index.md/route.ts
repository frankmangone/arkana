import { getAgentMarkdown } from "@/lib/agent-content";
import { languages } from "@/lib/i18n-config";
import { getPostPaths } from "@/lib/posts/translations";

export const dynamic = "force-static";
// Only the posts listed below exist; anything else is a 404.
export const dynamicParams = false;

interface RouteParams {
  lang: string;
  folder: string;
  slug: string;
}

// A markdown copy of every visible post, in each language it exists in. The
// page links to it with <link rel="alternate" type="text/markdown">.
export async function generateStaticParams(): Promise<RouteParams[]> {
  const posts = await getPostPaths();
  return posts.flatMap((post) =>
    post.languages
      .filter((lang) => languages.includes(lang))
      .map((lang) => ({ lang, folder: post.folder, slug: post.slug }))
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { lang, folder, slug } = await params;
  const markdown = await getAgentMarkdown(lang, folder, slug);
  if (markdown === null) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
