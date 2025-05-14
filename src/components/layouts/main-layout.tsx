import { Navbar } from "./navbar";
import { ArkanaBackground } from "./arkana-background";
// import { BuyMeCoffeeButton } from "../buy-me-coffee-button";

interface MainLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export const MainLayout = async (props: MainLayoutProps) => {
  const { children, lang } = props;

  return (
    <>
      <ArkanaBackground />
      <div className="relative min-h-screen">
        <Navbar lang={lang} />
        <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-8xl">
          {children}
        </main>
        {/* <BuyMeCoffeeButton /> */}
      </div>
    </>
  );
};
