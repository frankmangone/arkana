import { getPostFromReadingList } from "@/lib/reading-lists";
import { MainLayout } from "@/components/layouts/main-layout";
import { NotFoundReadingList } from "@/components/not-found-reading-list";
import { ReadingListPostPage } from "@/features/reading-lists/post";
import { getPostBySlug } from "@/features/posts/actions";

export { generateStaticParams } from "./static-params";

interface ReadingListPostPageParams {
  lang: string;
  id: string;
  post: string;
}

export interface ReadingListPostPageProps {
  params: Promise<ReadingListPostPageParams>;
}

// export async function generateMetadata({
//   params,
// }: PageProps): Promise<Metadata> {
//   const { folder, slug, lang } = await params;
//   const fullSlug = `${folder}/${slug}`;
//   const post = await getPostBySlug(fullSlug, lang);

//   if (!post) {
//     return {
//       title: "Post Not Found",
//       description: "The requested post could not be found.",
//     };
//   }

//   // Base URL para links absolutos
//   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.io";
//   const canonicalUrl = `${baseUrl}/${lang}/blog/${fullSlug}`;
//   const imageUrl = post.metadata.thumbnail
//     ? `${baseUrl}${post.metadata.thumbnail}`
//     : `${baseUrl}/images/arkana-default-og.png`;

//   return {
//     title: `Arkana | ${post.metadata.title}`,
//     description: post.metadata.description,
//     authors: [{ name: post.metadata.author }],
//     keywords: post.metadata.tags,
//     metadataBase: new URL(baseUrl),
//     alternates: {
//       canonical: canonicalUrl,
//       languages: {
//         en: `${baseUrl}/en/blog/${fullSlug}`,
//         es: `${baseUrl}/es/blog/${fullSlug}`,
//         pt: `${baseUrl}/pt/blog/${fullSlug}`,
//       },
//     },
//     openGraph: {
//       title: post.metadata.title,
//       description: post.metadata.description || "",
//       url: canonicalUrl,
//       siteName: "Arkana Blog",
//       images: [
//         {
//           url: imageUrl,
//           width: 1200,
//           height: 630,
//           alt: post.metadata.title,
//         },
//       ],
//       locale: lang,
//       type: "article",
//       publishedTime: post.metadata.date,
//       authors: [post.metadata.author],
//       tags: post.metadata.tags,
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: post.metadata.title,
//       description: post.metadata.description || "",
//       images: [imageUrl],
//     },
//   };
// }

export default async function Page({ params }: ReadingListPostPageProps) {
  const { lang, id, post: postId } = await params;
  const postFromReadingList = getPostFromReadingList({ lang, id, postId });

  if (!postFromReadingList) {
    return (
      <MainLayout lang={lang}>
        <NotFoundReadingList lang={lang} />
      </MainLayout>
    );
  }

  const slug = postFromReadingList.slug;
  const post = await getPostBySlug(slug, lang);

  if (!post) {
    return (
      <MainLayout lang={lang}>
        <NotFoundReadingList lang={lang} />
      </MainLayout>
    );
  }

  return (
    <MainLayout lang={lang}>
      <ReadingListPostPage lang={lang} id={id} slug={slug} post={post} />
    </MainLayout>
  );
}
