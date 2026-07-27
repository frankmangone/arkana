import { PageParams } from "./page";
import { getPostPaths } from "@/lib/posts/translations";
import { languages } from "@/lib/i18n-config";

export async function generateStaticParams(): Promise<PageParams[]> {
  const posts = await getPostPaths();

  // Emit every lang x folder/slug combination — a missing translation
  // renders the NotFoundInLanguage placeholder (see PostPage) instead of
  // a build-time "missing param" error / hard 404.
  return posts.flatMap((post) =>
    languages.map((lang) => ({
      lang,
      folder: post.folder,
      slug: post.slug,
    }))
  );
}
