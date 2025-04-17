import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BuyMeCoffeeButton } from "@/components/buy-me-coffee-button";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Episteme | Home",
  description: "A personal blog with multilingual support",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const homeUrl = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${lang}`;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.15.3/dist/katex.min.css"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <header className="border-b">
              <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl flex items-center justify-between py-4">
                <Link
                  href={homeUrl}
                  className="text-2xl font-bold hover:text-blue-500 transition-colors"
                >
                  Episteme
                </Link>
                <LanguageSwitcher />
              </div>
            </header>
            <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-6xl">
              {children}
            </main>
            <BuyMeCoffeeButton />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
