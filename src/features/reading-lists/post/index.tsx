import { PostContent } from "@/components/custom/post-content";
import { PostHeader } from "@/components/custom/post-header";
import { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";
import Script from "next/script";

interface ReadingListPostPageProps {
  lang: string;
  id: string;
  slug: string;
  post: Post;
}

export async function ReadingListPostPage(props: ReadingListPostPageProps) {
  const { lang, slug, post } = props;

  // Get the writer information
  const writer = getWriter(post.metadata.author);

  // Get the PostHeader component and await it
  const header = await PostHeader({ post, lang });

  // Base URL for absolute links
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.blog";
  const postUrl = `${baseUrl}/${lang}/blog/${slug}`;
  const imageUrl = post.metadata.thumbnail
    ? `${baseUrl}${post.metadata.thumbnail}`
    : `${baseUrl}/images/arkana-default-og.png`;

  // Create structured data for the article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    description: post.metadata.description,
    image: imageUrl,
    datePublished: post.metadata.date,
    author: {
      "@type": "Person",
      name: writer.name,
      url: `${baseUrl}/${lang}/writers/${writer.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Arkana",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/logo.png`,
      },
    },
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    keywords: post.metadata.tags.join(", "),
    inLanguage: lang,
  };

  return (
    <article className="container py-8 max-w-3xl mx-auto">
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {header}
      <PostContent post={post} />
      {/* <PostFooter post={post} lang={lang} dictionary={dict} /> */}
      {/* <RelatedPosts
        tags={post.tags}
        currentPostId={post.id}
        lang={lang}
        dictionary={dict}
      /> */}
    </article>
  );
}
