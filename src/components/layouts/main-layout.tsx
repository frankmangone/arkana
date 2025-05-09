import Link from "next/link";
import { LanguageSwitcher } from "../language-switcher";
import { getDictionary } from "@/lib/dictionaries";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { GradientBackground } from "@/components/gradient-background";
// import { BuyMeCoffeeButton } from "../buy-me-coffee-button";

interface MainLayoutProps {
  children: React.ReactNode;
  lang: string;
}

export const MainLayout = async (props: MainLayoutProps) => {
  const { children, lang } = props;

  const dict = await getDictionary(lang);

  const homeUrl = `/${lang}`;
  const readingListsUrl = `/${lang}/reading-lists`;
  const writersUrl = `/${lang}/writers`;

  return (
    <>
      <GradientBackground />
      <div className="relative min-h-screen">
        <header className="border-b">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl flex items-center justify-between py-4">
            <Link
              href={homeUrl}
              className="text-2xl font-bold text-primary-500 transition-colors"
            >
              Arkana
            </Link>

            <div className="flex items-center">
              {/* Desktop navigation */}
              <div className="hidden md:flex items-center">
                <Link
                  href={readingListsUrl}
                  className="px-4 py-2 inline-flex cursor-pointer items-center justify-center rounded-md text-base font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-300 dark:hover:text-primary-500"
                >
                  {dict.readingLists.list.title}
                </Link>
                <Link
                  href={writersUrl}
                  className="px-4 py-2 inline-flex cursor-pointer items-center justify-center rounded-md text-base font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-300 dark:hover:text-primary-500"
                >
                  {dict.writers.title}
                </Link>
              </div>

              <LanguageSwitcher />

              {/* Mobile hamburger menu */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={readingListsUrl} className="w-full">
                        {dict.readingLists.list.title}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={writersUrl} className="w-full">
                        {dict.writers.title}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8 max-w-6xl">
          {children}
        </main>
        {/* <BuyMeCoffeeButton /> */}
      </div>
    </>
  );
};
