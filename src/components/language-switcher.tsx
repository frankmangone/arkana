"use client";

import { usePathname, useRouter } from "next/navigation";
import { languages } from "@/lib/i18n-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { withLocalePath } from "@/lib/site-config";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (locale: string) => {
    // Get the path without the locale
    const pathWithoutLocale = pathname.split("/").slice(2).join("/");
    const newPath = withLocalePath(locale, pathWithoutLocale);
    router.push(newPath);
  };

  // Extract current locale from pathname
  const currentLocale = pathname.split("/")[1];

  const languageNames = {
    en: "English",
    es: "Español",
    pt: "Português",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="eyebrow inline-flex cursor-pointer items-center gap-1.5 px-4 py-2 transition-colors hover:text-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languageNames[currentLocale as keyof typeof languageNames]}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={`${
              locale === currentLocale ? "text-primary-800" : ""
            } cursor-pointer py-3 text-base`}
          >
            {languageNames[locale as keyof typeof languageNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
