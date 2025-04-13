import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BuyMeCoffeeButton } from "@/components/buy-me-coffee-button";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Blog",
  description: "A personal blog with multilingual support",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;

  return (
    <html lang={lang} suppressHydrationWarning>
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
                <h1 className="text-2xl font-bold">Frank Mangone</h1>
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
