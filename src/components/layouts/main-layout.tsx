import Link from "next/link";
import { LanguageSwitcher } from "../language-switcher";
import { BuyMeCoffeeButton } from "../buy-me-coffee-button";
import { getDictionary } from "@/lib/dictionaries";

interface MainLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export const MainLayout = async (props: MainLayoutProps) => {
  const { children, lang } = props;

  const dict = await getDictionary(lang);

  const homeUrl = `/${lang}`;
  const readingListsUrl = `/${lang}/reading-lists`;

  return (
    <div className="relative min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl flex items-center justify-between py-4">
          <div className="flex items-center space-x-6">
            <Link
              href={homeUrl}
              className="text-2xl font-bold hover:text-blue-500 transition-colors"
            >
              Episteme
            </Link>
            <Link
              href={readingListsUrl}
              className="nav-bar hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
            >
              {dict.readingLists.list.title}
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-6xl">
        {children}
      </main>
      <BuyMeCoffeeButton />
    </div>
  );
};
