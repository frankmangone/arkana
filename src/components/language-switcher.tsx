"use client";

import { usePathname, useRouter } from "next/navigation";
import { languages } from "@/lib/i18n-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arkana.blog";

  const switchLanguage = (locale: string) => {
    // Get the path without the locale
    const pathWithoutLocale = pathname.split("/").slice(2).join("/");
    const newPath = `${baseUrl}/${locale}/${pathWithoutLocale}`;
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
        <Button
          variant="ghost"
          className="h-[40px] rounded-none py-2 px-4 flex cursor-pointer items-center gap-1 text-base hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
        >
          <Globe className="h-7 w-7 sm:h-6 sm:w-6" />
          <span className="hidden sm:inline">
            {languageNames[currentLocale as keyof typeof languageNames]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLanguage(locale)}
            className={`${
              locale === currentLocale ? "bg-muted" : ""
            } cursor-pointer py-3 text-base`}
          >
            {languageNames[locale as keyof typeof languageNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
