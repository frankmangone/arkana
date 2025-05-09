import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arkana | Home",
  description: "The place to where complex topics are simplified",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
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
      </head>
      <body className={spaceGrotesk.className}>
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
