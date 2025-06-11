import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arkana | Cryptography, Blockchain & Mathematics Learning",
  description: "Where technology meets clarity.",
  keywords: [
    "cryptography",
    "blockchain",
    "mathematics",
    "elliptic curves",
    "zero knowledge proofs",
    "smart contracts",
    "solana",
    "ethereum",
    "encryption",
    "hashing",
    "protocols",
    "learning",
    "tutorials",
    "programming",
    "computer science",
    "technology education",
    "web3",
    "bitcoin",
    "digital signatures",
    "consensus algorithms",
    "rollups",
    "internet protocols",
    "TCP/IP",
    "DNS",
  ],
  authors: [{ name: "Frank Mangone" }, { name: "Gonzalo Bustos" }],
  creator: "Frank Mangone",
  publisher: "Arkana",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.blog"
  ),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [{ url: "/logo.png", sizes: "60x60", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Arkana",
    title: "Arkana | Cryptography, Blockchain & Mathematics Learning",
    description:
      "Learn cryptography, blockchain technology, and mathematics with comprehensive tutorials covering zero-knowledge proofs, elliptic curves, smart contracts, and more.",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Arkana - Cryptography, Blockchain & Mathematics Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arkana | Cryptography, Blockchain & Mathematics Learning",
    description:
      "Learn cryptography, blockchain technology, and mathematics with comprehensive tutorials covering zero-knowledge proofs, elliptic curves, smart contracts, and more.",
    images: ["/og.png"],
    creator: "@arkana_blog",
  },
  alternates: {
    languages: {
      en: "/en",
      es: "/es",
      pt: "/pt",
    },
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arkana.blog";

  // JSON-LD structured data for the organization
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${baseUrl}/#organization`,
    name: "Arkana",
    alternateName: "Arkana Blog",
    url: baseUrl,
    description:
      "Educational platform for learning cryptography, blockchain technology, and advanced mathematics",
    educationalCredentialAwarded:
      "Knowledge and Skills in Cryptography and Blockchain",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Educational Content",
      itemListElement: [
        {
          "@type": "Course",
          name: "Cryptography 101",
          description:
            "Beginner-friendly introduction to cryptography concepts",
          provider: {
            "@type": "EducationalOrganization",
            name: "Arkana",
          },
        },
        {
          "@type": "Course",
          name: "Blockchain 101",
          description: "Beginner-friendly introduction to blockchain concepts",
          provider: {
            "@type": "EducationalOrganization",
            name: "Arkana",
          },
        },
        {
          "@type": "Course",
          name: "Elliptic Curves In-Depth",
          description:
            "Deep dive into elliptic curve mathematics and cryptography",
          provider: {
            "@type": "EducationalOrganization",
            name: "Arkana",
          },
        },
      ],
    },
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
      width: 60,
      height: 60,
    },
    sameAs: [
      "https://twitter.com/arkana_blog",
      "https://github.com/arkana-blog",
    ],
  };

  // JSON-LD for the website
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "Arkana",
    description:
      "Master cryptography, blockchain technology, and advanced mathematics with clear, beginner-friendly tutorials",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en", "es", "pt"],
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/katex.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
              })()
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={spaceGrotesk.className}>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
