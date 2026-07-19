import React from "react";
import { Navbar } from "./navbar";
import { Footer } from "../ui/footer";

interface HomeLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export function HomeLayout({ children, lang }: HomeLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-page overflow-x-clip">
      <Navbar lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}
