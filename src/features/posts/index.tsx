import { Suspense } from "react";
import { getDictionary } from "@/lib/dictionaries";
import { getPostBySlug } from "./actions";
import { PostHeader } from "../../components/ui/post-header";
import { Metadata } from "next";
import { NotFoundInLanguage } from "@/components/not-found-in-language";
import { getWriter } from "@/lib/writers";
import { PostContent } from "@/components/ui/post-content";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { SectionDivider } from "@/components/ui/section-divider";
import BuyMeCoffeeWidget from "@/components/ui/buy-me-coffee";
import { CommentSection } from "@/components/ui/comments";
import { ReadTracker } from "@/components/ui/post-actions/read-tracker";
import { SITE_URL, withLocalePath, withSiteUrl } from "@/lib/site-config";

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
  const header = await PostHeader({
    post,
    lang,
    path: slug,
    breadcrumbs: [
      { label: dict.blog.title, href: withLocalePath(lang, "blog") },
      { label: post.metadata.title },
    ],
  });

  // Base URL for absolute links
  const baseUrl = SITE_URL;
  const postUrl = `${baseUrl}${withLocalePath(lang, `blog/${slug}`)}`;
  const imageUrl = post.metadata.thumbnail
    ? withSiteUrl(post.metadata.thumbnail)
    : withSiteUrl("/images/arkana-default-og.png");

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
      url: `${baseUrl}${withLocalePath(lang, `writers/${writer.slug}`)}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Arkana",
      logo: {
        "@type": "ImageObject",
        url: withSiteUrl("/logo.png"),
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Arkana",
        item: `${baseUrl}${withLocalePath(lang)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dict.blog.title,
        item: `${baseUrl}${withLocalePath(lang, "blog")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.metadata.title,
        item: postUrl,
      },
    ],
  };

  return (
    <article className="container pb-8 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {header}
      <ReadingProgress />
      <PostContent post={post} quizDictionary={dict.quiz} />
      <ReadTracker path={slug} />
      {writer.walletAddress &&
        writer.walletAddress !==
          "0x0000000000000000000000000000000000000000" && (
          <BuyMeCoffeeWidget
            authorName={writer.name}
            walletAddress={writer.walletAddress}
            dictionary={dict.buyMeCoffee}
          />
        )}

      <SectionDivider />
      <Suspense fallback={null}>
        <CommentSection path={slug} />
      </Suspense>
    </article>
  );
}
