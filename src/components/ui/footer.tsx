import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { withLocalePath } from "@/lib/site-config";
import { ArkanaStrip } from "@/components/arkana-strip";

interface FooterProps {
  lang: string;
}

// Stable seed so the footer glyph band is identical on every render
const FOOTER_STRIP_SEED = BigInt(
  "0x8041f4a777ffb79cea43fae4fa7b435423b08041f4a777ffb79cea43fae4fa7b"
);

export async function Footer({ lang }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const dictionary = await getDictionary(lang);

  const links = [
    { href: withLocalePath(lang, "blog"), label: dictionary.blog.title },
    {
      href: withLocalePath(lang, "reading-lists"),
      label: dictionary.readingLists.list.title,
    },
    { href: withLocalePath(lang, "writers"), label: dictionary.writers.title },
    { href: withLocalePath(lang, "faq"), label: dictionary.faq.title },
  ];

  return (
    <footer className="mt-24 border-t border-rule bg-[image:var(--grad-fade-up)]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <Link
            href={withLocalePath(lang)}
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

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="eyebrow transition-colors hover:text-ink-heading"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <ArkanaStrip
          randomSeed={FOOTER_STRIP_SEED}
          className="my-10 opacity-50"
        />

        <div className="flex flex-wrap justify-center gap-2 text-center">
          <p className="text-sm text-ink-faint">
            © {currentYear} {dictionary?.footer?.copyright || "Arkana Blog"}.
          </p>
          <p className="text-sm text-ink-faint">
            {dictionary?.footer?.madeWith || "Made with"}{" "}
            <Heart className="inline h-4 w-4 text-salmon-600" />{" "}
            {dictionary?.footer?.by || "by"}{" "}
            <Link
              href="https://www.linkedin.com/in/frank-mangone/"
              className="text-primary-800 transition-colors hover:text-primary-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              {dictionary?.footer?.author || "Franco Mangone"}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
