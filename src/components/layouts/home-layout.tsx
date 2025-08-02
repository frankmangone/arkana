import React from "react";
import { Navbar } from "./navbar";
import { ArkanaBackground } from "./arkana-background";
import Image from "next/image";
import { Footer } from "../custom/footer";

interface HomeLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export function HomeLayout({ children, lang }: HomeLayoutProps) {
  return (
    <>
      <ArkanaBackground />
      <Navbar lang={lang} containerClassName="max-w-8xl" />
      <div className="hidden xl:block absolute top-0 right-0 h-full flex items-center justify-end pointer-events-none z-0 ml-[520px]">
        <Image
          src="/render.png"
          alt="Arkana 3D Logo"
          width={1300}
          height={400}
          className="drop-shadow-2xl select-none"
          priority
        />
      </div>
      <main className="relative z-10">{children}</main>
      <Footer lang={lang} />
    </>
  );
}
