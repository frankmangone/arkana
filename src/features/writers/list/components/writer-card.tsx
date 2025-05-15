"use client";

import { User, Pencil, Twitter, Github, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Writer {
  slug: string;
  name: string;
  bio?: Record<string, string>;
  imageUrl?: string;
  role?: Record<string, string>;
  articleCount?: number;
  social?: {
    twitter?: string;
    github?: string;
    medium?: string;
    website?: string;
  };
}

interface WriterCardProps {
  writer: Writer;
  lang: string;
  dictionary: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function WriterCard({ writer, lang, dictionary }: WriterCardProps) {
  return (
    <div className="group">
      <Link href={`/${lang}/writers/${writer.slug}`} className="block">
        {/* Writer image with portrait styling */}
        <div className="relative h-64 mb-4 hidden md:block">
          {writer.imageUrl ? (
            <div className="relative h-full">
              {/* Background blur effect */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                    writer.imageUrl
                  }`}
                  alt=""
                  fill
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-90" />
              </div>

              {/* Writer icon */}
              <div className="absolute top-4 right-4 bg-black/70 p-2 rounded-full">
                <Pencil className="h-5 w-5 text-primary-500" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100 dark:bg-gray-800 relative">
              <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-background bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-20 w-20 text-gray-400" />
              </div>
              <div className="absolute top-4 right-4 bg-black/70 p-2 rounded-full">
                <Pencil className="h-5 w-5 text-primary-500" />
              </div>
            </div>
          )}
        </div>

        {/* Writer info */}
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
          <User className="h-4 w-4" />
          <span>{writer.role?.[lang] || dictionary.writers.writer}</span>
          {writer.articleCount !== undefined && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-500">
              {writer.articleCount}{" "}
              {writer.articleCount === 1
                ? dictionary.writers.article
                : dictionary.writers.articles}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold mb-2 text-primary-500 group-hover:text-primary-600 transition-colors">
          {writer.name}
        </h2>

        <p className="text-gray-400 text-md mb-4 line-clamp-2">
          {writer.bio?.[lang] || ""}
        </p>
      </Link>

      {/* Social links */}
      {writer.social && Object.values(writer.social).some(Boolean) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {writer.social.twitter && (
            <a
              href={writer.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-500/20 hover:text-primary-500 transition-colors"
            >
              <Twitter className="h-3 w-3" />
              <span>Twitter</span>
            </a>
          )}
          {writer.social.github && (
            <a
              href={writer.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-500/20 hover:text-primary-500 transition-colors"
            >
              <Github className="h-3 w-3" />
              <span>GitHub</span>
            </a>
          )}
          {writer.social.medium && (
            <a
              href={writer.social.medium}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-500/20 hover:text-primary-500 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Medium</span>
            </a>
          )}
          {writer.social.website && (
            <a
              href={writer.social.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-500/20 hover:text-primary-500 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Website</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
