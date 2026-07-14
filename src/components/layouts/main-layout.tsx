import { Navbar } from "./navbar";
import { Footer } from "../ui/footer";

interface MainLayoutProps {
  children: React.ReactNode;
  lang: string;
  footer?: boolean;
}

export const MainLayout = async (props: MainLayoutProps) => {
  const { children, lang, footer = true } = props;

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <Navbar lang={lang} />
      <main className="flex-1 w-full mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
        {children}
      </main>
      {footer && <Footer lang={lang} />}
    </div>
  );
};
