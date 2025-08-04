import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

interface FooterProps {
  lang: string;
}

export async function Footer({ lang }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const dictionary = await getDictionary(lang);

  return (
    <footer className="relative w-full py-12 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>

      {/* Decorative gradient orb */}
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-96 h-48 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative container mx-auto max-w-6xl z-10">
        {/* Bottom section */}
        <div className="flex flex-wrap justify-center gap-2 border-t border-primary-500/20 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm flex-shrink-0 min-w-0 break-words">
            © {currentYear} {dictionary?.footer?.copyright || "Arkana Blog"}.
          </p>
          <p className="text-gray-500 text-sm flex-shrink-0 min-w-0 break-words">
            {dictionary?.footer?.madeWith || "Made with"}{" "}
            <Heart className="inline w-4 h-4 text-red-500" />{" "}
            {dictionary?.footer?.by || "by"}{" "}
            <Link
              href="https://www.linkedin.com/in/frank-mangone/"
              className="text-primary-500 hover:text-primary-700 transition-colors"
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
