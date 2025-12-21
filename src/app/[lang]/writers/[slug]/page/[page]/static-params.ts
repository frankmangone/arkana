import { writers } from "@/lib/writers";
import { languages } from "@/lib/i18n-config";
import { getPostsByAuthor } from "@/lib/posts";

export const POSTS_PER_PAGE = 9; // 3x3 grid

export async function generateStaticParams() {
  const paths = [];

  for (const lang of languages) {
    for (const writerSlug of Object.keys(writers)) {
      // Always generate at least page 1 for every writer in every language
      paths.push({
        slug: writerSlug,
        lang,
        page: "1",
      });

      // Get writer's posts to calculate total pages
      const posts = await getPostsByAuthor(writerSlug, lang);
      const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

      // Generate additional pages if there are more posts
      for (let page = 2; page <= totalPages; page++) {
        paths.push({
          slug: writerSlug,
          lang,
          page: page.toString(),
        });
      }
    }
  }

  return paths;
}

