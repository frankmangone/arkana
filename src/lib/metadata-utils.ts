import { Metadata } from "next";
import { SITE_URL, withSiteUrl } from "@/lib/site-config";
import { defaultLanguage, languages as allLanguages } from "@/lib/i18n-config";

const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
  pt: "pt_BR",
};

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
  availableLanguages?: string[]; // languages this page exists in; defaults to all
  canonicalPath?: string; // canonical target when this URL is a duplicate (defaults to path)
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
  availableLanguages,
  canonicalPath,
}: BaseMetadataOptions): Metadata {
  const effectivePath = canonicalPath ?? path;
  const fullPath = effectivePath ? `/${lang}/${effectivePath}` : `/${lang}`;
  const canonicalUrl = `${SITE_URL}${fullPath}`;
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : withSiteUrl(image)
    : withSiteUrl("/og.png?v=2"); // ?v busts scraper caches (Slack/Twitter) when the image changes

  const available = availableLanguages ?? [...allLanguages];
  const languageAlternates: Record<string, string> = {};
  for (const language of available) {
    languageAlternates[language] =
      `${SITE_URL}/${language}${effectivePath ? `/${effectivePath}` : ""}`;
  }
  if (available.includes(defaultLanguage)) {
    languageAlternates["x-default"] =
      `${SITE_URL}/${defaultLanguage}${effectivePath ? `/${effectivePath}` : ""}`;
  }

  const metadata: Metadata = {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
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
      locale: OG_LOCALES[lang] ?? lang,
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
