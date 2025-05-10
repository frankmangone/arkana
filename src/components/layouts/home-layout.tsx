import React from "react";
import { Navbar } from "./navbar";
import { ArkanaBackground } from "./arkana-background";

interface HomeLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export function HomeLayout({ children, lang }: HomeLayoutProps) {
  return (
    <>
      <ArkanaBackground />
      <Navbar lang={lang} />
      <main className="container z-10 mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-6xl">
        {children}
      </main>
    </>
  );
}
