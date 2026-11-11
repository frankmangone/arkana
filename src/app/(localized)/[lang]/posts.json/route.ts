import { getPublicPosts } from "@/lib/agent-content";
import { buildPostsIndex } from "@/lib/agent-content/posts-index";
import { languages, type Locale } from "@/lib/i18n-config";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

// Every visible article in this language, as JSON (see buildPostsIndex).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const { lang } = await params;
  const posts = await getPublicPosts();
  return Response.json(buildPostsIndex(lang, posts));
}
