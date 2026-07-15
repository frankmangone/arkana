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
import { AuthButton } from "../auth-button";
import { withLocalePath } from "@/lib/site-config";

interface NavbarProps {
  lang: string;
  containerClassName?: string;
}

export const Navbar = async (props: NavbarProps) => {
  const { lang, containerClassName } = props;

  const dict = await getDictionary(lang);

  const homeUrl = withLocalePath(lang);
  const readingListsUrl = withLocalePath(lang, "reading-lists");

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-surface-page/80 backdrop-blur-md">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8",
          containerClassName
        )}
      >
        <Link
          href={homeUrl}
          className="flex items-center gap-2.5 text-xl text-primary-750 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.svg"
            alt="Arkana Logo"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          arkana
        </Link>

        <div className="flex items-center gap-1">
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center">
            <Link
              href={readingListsUrl}
              className="eyebrow px-4 py-2 transition-colors hover:text-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dict.readingLists.list.title}
            </Link>
            <Link
              href="https://forms.gle/NLk49eNnu6jTwGMt8"
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow px-4 py-2 transition-colors hover:text-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dict.blog.survey}
            </Link>
          </nav>

          <LanguageSwitcher />
          <AuthButton />

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 cursor-pointer"
                >
                  <Menu className="h-5 w-5" />
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
                    href="https://forms.gle/NLk49eNnu6jTwGMt8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full cursor-pointer py-3 text-base"
                  >
                    {dict.blog.survey}
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
