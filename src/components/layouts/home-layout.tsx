import React from "react";
import { Navbar } from "./navbar";
import { ArkanaBackground } from "./arkana-background";
import Image from "next/image";

interface HomeLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export function HomeLayout({ children, lang }: HomeLayoutProps) {
  return (
    <>
      <ArkanaBackground />
      <Navbar lang={lang} />
      <div className="hidden lg:block absolute top-10 xl:top-0 right-0 h-full flex items-center justify-end pointer-events-none z-0 mt-[150px] ml-[200px]">
        <Image
          src="/render.png"
          alt="Arkana 3D Logo"
          width={1100}
          height={400}
          className="drop-shadow-2xl select-none"
          priority
        />
      </div>
      <main className="container z-10 mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-8xl">
        {children}
      </main>
    </>
  );
}
