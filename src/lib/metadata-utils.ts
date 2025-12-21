import { Metadata } from "next";

interface BaseMetadataOptions {
  lang: string;
  path: string; // e.g., "", "writers", "blog/the-zk-chronicles/first-steps"
  title: string;
  description: string;
  image?: string; // defaults to /og.png
  ogTitle?: string; // defaults to title
  siteName?: string; // defaults to "Arkana"
  type?: "website" | "article";
  // Article-specific fields
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
  keywords?: string[];
}

export function generateBaseMetadata({
  lang,
  path,
  title,
  description,
  image,
  ogTitle,
  siteName = "Arkana",
  type = "website",
  publishedTime,
  authors,
  tags,
  keywords,
}: BaseMetadataOptions): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.blog";
  const fullPath = path ? `/${lang}/${path}` : `/${lang}`;
  const canonicalUrl = `${baseUrl}${fullPath}`;
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${baseUrl}${image}`
    : `${baseUrl}/og.png`;

  const metadata: Metadata = {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en${path ? `/${path}` : ""}`,
        es: `${baseUrl}/es${path ? `/${path}` : ""}`,
        pt: `${baseUrl}/pt${path ? `/${path}` : ""}`,
      },
    },
    openGraph: {
      title: ogTitle || title,
      description: description || "",
      url: canonicalUrl,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle || title,
        },
      ],
      locale: lang,
      type,
      ...(type === "article" && {
        publishedTime,
        authors,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle || title,
      description: description || "",
      images: [imageUrl],
    },
  };

  // Add authors and keywords at top level for articles
  if (authors && authors.length > 0) {
    metadata.authors = authors.map((name) => ({ name }));
  }
  if (keywords) {
    metadata.keywords = keywords;
  }

  return metadata;
}

