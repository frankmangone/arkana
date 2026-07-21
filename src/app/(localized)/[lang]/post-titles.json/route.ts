import { getAllPosts } from "@/lib/posts";
import { languages } from "@/lib/i18n-config";

export const dynamic = "force-static";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const posts = await getAllPosts(lang);

  const titles: Record<string, string> = {};
  for (const post of posts) {
    titles[post.slug] = post.title;
  }

  return Response.json(titles);
}
