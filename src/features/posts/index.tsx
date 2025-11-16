import { getDictionary } from "@/lib/dictionaries";
import { getPostBySlug } from "./actions";
import { PostHeader } from "../../components/custom/post-header";
import { Metadata } from "next";
import { NotFoundInLanguage } from "@/components/not-found-in-language";
import Script from "next/script";
import { getWriter } from "@/lib/writers";
import { PostContent } from "@/components/custom/post-content";
import { PostActions } from "@/components/custom/post-actions";
import { BuyMeCoffee } from "@/components/custom/buy-me-coffee";

interface PostPageProps {
  lang: string;
  slug: string;
}

interface MetadataParams {
  params: PostPageProps;
}

export async function generateMetadata({
  params,
}: MetadataParams): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await getPostBySlug(slug, lang);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    authors: [{ name: post.metadata.author }],
    keywords: post.metadata.tags,
  };
}

export async function PostPage(props: PostPageProps) {
  const { lang, slug } = props;

  const dict = await getDictionary(lang);
  const post = await getPostBySlug(slug, lang);

  if (!post) {
    return <NotFoundInLanguage lang={lang} />;
  }

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
      {process.env.NEXT_PUBLIC_AUTH_ENABLED === "true" && <PostActions />}
      <PostContent post={post} />
      {writer.walletAddress && writer.walletAddress !== "0x0000000000000000000000000000000000000000" && (
        <BuyMeCoffee 
          authorName={writer.name} 
          walletAddress={writer.walletAddress}
          dictionary={dict.buyMeCoffee}
        />
      )}
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
