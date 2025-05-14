import Link from "next/link";
import Image from "next/image";
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
import { cn } from "@/lib/utils";

interface NavbarProps {
  lang: string;
  containerClassName?: string;
}

export const Navbar = async (props: NavbarProps) => {
  const { lang, containerClassName } = props;

  const dict = await getDictionary(lang);

  const homeUrl = `/${lang}`;
  const readingListsUrl = `/${lang}/reading-lists`;
  const writersUrl = `/${lang}/writers`;

  return (
    <header className="relative z-10">
      <div
        className={cn(
          "container mx-auto px-4 md:px-6 lg:px-8 max-w-8xl flex items-center justify-between py-4",
          containerClassName
        )}
      >
        <Link
          href={homeUrl}
          className="flex items-center gap-2 text-2xl text-primary-500 transition-colors"
        >
          <Image
            src="/logo.svg"
            alt="Arkana Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          arkana
        </Link>

        <div className="flex items-center">
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center">
            <Link
              href={readingListsUrl}
              className="px-4 py-2 inline-flex cursor-pointer items-center justify-center text-base font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-300 dark:hover:text-primary-500"
            >
              {dict.readingLists.list.title}
            </Link>
            <Link
              href={writersUrl}
              className="px-4 py-2 inline-flex cursor-pointer items-center justify-center text-base font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-gray-300 dark:hover:text-primary-500"
            >
              {dict.writers.title}
            </Link>
          </div>

          <LanguageSwitcher />

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-[50px] px-6 cursor-pointer"
                >
                  <Menu className="h-7 w-7" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link
                    href={readingListsUrl}
                    className="w-full cursor-pointer py-3 text-base"
                  >
                    {dict.readingLists.list.title}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={writersUrl}
                    className="w-full cursor-pointer py-3 text-base"
                  >
                    {dict.writers.title}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
