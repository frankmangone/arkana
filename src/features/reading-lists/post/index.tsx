import { PostContent } from "@/components/ui/post-content";
import { PostHeader } from "@/components/custom/post-header";
import { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";
import { getReadingList } from "@/lib/reading-lists";
import Script from "next/script";
import { Navigation } from "./components/navigation";
import BuyMeCoffeeWidget from "@/components/ui/buy-me-coffee";
import { getDictionary } from "@/lib/dictionaries";
import { SectionDivider } from "@/components/ui/section-divider";

interface ReadingListPostPageProps {
  lang: string;
  id: string;
  slug: string;
  post: Post;
}

export async function ReadingListPostPage(props: ReadingListPostPageProps) {
  const { lang, id, slug, post } = props;

  const dict = await getDictionary(lang);
  const writer = getWriter(post.metadata.author);

  // Base URL for absolute links
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.blog";
  const postUrl = `${baseUrl}/${lang}/blog/${slug}`;
  const imageUrl = post.metadata.thumbnail
    ? `${baseUrl}${post.metadata.thumbnail}`
    : `${baseUrl}/images/arkana-default-og.png`;

  // Get reading list data for navigation
  const readingList = getReadingList({ lang, id });
  const currentIndex =
    readingList?.items.findIndex((item) => item.slug === slug) ?? -1;
  const prevItem =
    currentIndex > 0 ? readingList?.items[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < (readingList?.items.length ?? 0) - 1
      ? readingList?.items[currentIndex + 1]
      : null;

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
      <PostHeader post={post} lang={lang} />
      <PostContent post={post} />
      <SectionDivider />
      {writer.walletAddress && writer.walletAddress !== "0x0000000000000000000000000000000000000000" && (
        <BuyMeCoffeeWidget authorName={writer.name} walletAddress={writer.walletAddress} dictionary={dict.buyMeCoffee} />
      )}
      <Navigation lang={lang} id={id} prevItem={prevItem} nextItem={nextItem} />
    </article>
  );
}
