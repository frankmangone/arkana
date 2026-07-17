import { getAllPosts } from "@/lib/posts";
import { languages } from "@/lib/i18n-config";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const posts = (await getAllPosts(lang)).slice(0, 30);

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/${lang}/blog/${post.slug}/</link>
      <guid>${SITE_URL}/${lang}/blog/${post.slug}/</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Arkana</title>
    <link>${SITE_URL}/${lang}/</link>
    <description>Cryptography, blockchain and mathematics, explained clearly.</description>
    <language>${lang}</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
