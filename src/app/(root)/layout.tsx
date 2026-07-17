import type React from "react";
import { Space_Grotesk } from "next/font/google";
import "../globals.css";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Web3Provider } from "@/components/providers/web3-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import Script from "next/script";
import { SITE_URL, withSiteUrl } from "@/lib/site-config";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

// Root layout for "/" only (English, no locale prefix) — a sibling root to
// (localized)/[lang]/layout.tsx via route groups, so Next.js lets each
// declare its own <html>. Keep this in sync with that file: both must stay
// structurally equivalent (fonts, providers, dark-theme bootstrap, schema).
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = "en";
  const baseUrl = SITE_URL;

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
      url: withSiteUrl("/logo.png"),
      width: 60,
      height: 60,
    },
    sameAs: [
      "https://twitter.com/arkana_blog",
      "https://github.com/arkana-blog",
    ],
  };

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
    inLanguage: ["en", "es", "pt"],
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Inline so it applies before any stylesheet arrives: keeps any
            pre-paint window dark instead of white. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html { background-color: hsl(260, 30%, 8%); }`,
          }}
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
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Arkana RSS"
          href={`/${lang}/rss.xml`}
        />
      </head>
      <body className={`${spaceGrotesk.className} ${spaceGrotesk.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
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
          <Web3Provider>
            <WalletProvider>
              <AuthProvider>{children}</AuthProvider>
            </WalletProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
      {process.env.NEXT_PUBLIC_DEV_MODE !== "true" && (
        <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
      )}
    </html>
  );
}
