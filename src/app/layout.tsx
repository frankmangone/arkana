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
  title: "Arkana | Home",
  description: "Where technology meets clarity",
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
    title: "Arkana | Where complexity meets clarity",
    description: "Where complexity meets clarity",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Arkana Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arkana | Where complexity meets clarity",
    description: "Where complexity meets clarity",
    images: ["/og.png"],
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
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "Arkana",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
      width: 60,
      height: 60,
    },
    sameAs: [
      "https://twitter.com/arkana_blog",
      "https://github.com/arkana-blog",
      // Add other social profiles as needed
    ],
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
