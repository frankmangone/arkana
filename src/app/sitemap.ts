import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { languages } from "@/lib/i18n-config";
import { writers } from "@/lib/writers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.blog";
  const sitemap: MetadataRoute.Sitemap = [];

  for (const lang of languages) {
    sitemap.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    });

    sitemap.push({
      url: `${baseUrl}/${lang}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });

    sitemap.push({
      url: `${baseUrl}/${lang}/writers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const writerSlug of Object.keys(writers)) {
      sitemap.push({
        url: `${baseUrl}/${lang}/writers/${writerSlug}/page/1`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    const posts = await getAllPosts(lang);

    for (const post of posts) {
      const postUrl = `${baseUrl}/${lang}/blog/${post.slug}`;
      sitemap.push({
        url: postUrl,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return sitemap;
}
