import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "../language-switcher";
import { getDictionary } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";
import { AuthButton } from "../auth-button";
import { MobileMenu } from "./mobile-menu";
import { withLocalePath } from "@/lib/site-config";
import { NotificationBell } from "../notification-bell";

interface NavbarProps {
  lang: string;
  containerClassName?: string;
}

export const Navbar = async (props: NavbarProps) => {
  const { lang, containerClassName } = props;

  const dict = await getDictionary(lang);

  const homeUrl = withLocalePath(lang);
  const readingListsUrl = withLocalePath(lang, "reading-lists");
  const surveyUrl = withLocalePath(lang, "survey");

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
              href={surveyUrl}
              className="eyebrow px-4 py-2 transition-colors hover:text-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dict.blog.survey}
            </Link>
          </nav>

          <LanguageSwitcher />

          <NotificationBell />

          {/* On mobile the sign-in / account actions live in the hamburger */}
          <div className="hidden md:block">
            <AuthButton />
          </div>

          <div className="md:hidden">
            <MobileMenu
              lang={lang}
              labels={{
                readingLists: dict.readingLists.list.title,
                survey: dict.blog.survey,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
