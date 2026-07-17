import { PageParams } from "./page";
import { getPostPaths } from "@/lib/posts/translations";

export async function generateStaticParams(): Promise<PageParams[]> {
  const posts = await getPostPaths();

  // Only emit params for translations that actually exist — a missing
  // combination must 404, not render an indexable "Post Not Found" page.
  return posts.flatMap((post) =>
    post.languages.map((lang) => ({
      lang,
      folder: post.folder,
      slug: post.slug,
    }))
  );
}
