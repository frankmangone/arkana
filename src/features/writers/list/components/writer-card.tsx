"use client";

import { User, Pencil, Twitter, Github, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import { withLocalePath, withSiteUrl } from "@/lib/site-config";

interface Writer {
  slug: string;
  name: string;
  bio?: Record<string, string>;
  imageUrl?: string;
  role?: Record<string, string>;
  articleCount?: number;
  visible?: boolean;
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
  dictionary: Dictionary;
}

export function WriterCard({ writer, lang, dictionary }: WriterCardProps) {
  if (writer.visible === false) {
    return null;
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-md border border-rule transition-colors hover:border-rule-strong">
      <Link
        href={withLocalePath(lang, `writers/${writer.slug}`)}
        className="block"
      >
        {/* Writer image with portrait styling */}
        <div className="relative h-56 border-b border-rule hidden md:block">
          {writer.imageUrl ? (
            <div className="relative h-full">
              {/* Background blur effect */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={
                    writer.imageUrl
                      ? withSiteUrl(writer.imageUrl)
                      : "/placeholder.svg"
                  }
                  alt=""
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* Writer icon */}
              <div className="absolute top-3 right-3 rounded-[3px] border border-rule bg-surface-page/80 p-2 backdrop-blur-sm">
                <Pencil className="h-4 w-4 text-primary-800" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-ink-faint relative">
              <div className="relative h-56 w-56 overflow-hidden rounded-full border border-rule flex items-center justify-center">
                <User className="h-20 w-20 text-ink-faint" />
              </div>
              <div className="absolute top-3 right-3 rounded-[3px] border border-rule bg-surface-page/80 p-2 backdrop-blur-sm">
                <Pencil className="h-4 w-4 text-primary-800" />
              </div>
            </div>
          )}
        </div>

        {/* Writer info */}
        <div className="p-5 pb-0">
          <div className="flex items-center gap-2 mb-2 text-sm text-ink-faint">
            <User className="h-4 w-4" />
            <span>{writer.role?.[lang] || dictionary.writers.writer}</span>
            {writer.articleCount !== undefined && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-[3px] border border-rule text-primary-800">
                {writer.articleCount}{" "}
                {writer.articleCount === 1
                  ? dictionary.writers.article
                  : dictionary.writers.articles}
              </span>
            )}
          </div>

          <h2 className="text-xl font-semibold tracking-tight mb-2 text-ink-heading group-hover:text-primary-800 transition-colors">
            {writer.name}
          </h2>

          <p className="text-ink-muted text-sm mb-4 line-clamp-2">
            {writer.bio?.[lang] || ""}
          </p>
        </div>
      </Link>

      {/* Social links */}
      {writer.social && Object.values(writer.social).some(Boolean) && (
        <div className="mt-auto flex flex-wrap gap-2 p-5 pt-0">
          {writer.social.twitter && (
            <a
              href={writer.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-[3px] border border-rule text-ink-muted hover:border-primary-700 hover:text-primary-800 transition-colors"
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
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-[3px] border border-rule text-ink-muted hover:border-primary-700 hover:text-primary-800 transition-colors"
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
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-[3px] border border-rule text-ink-muted hover:border-primary-700 hover:text-primary-800 transition-colors"
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
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-[3px] border border-rule text-ink-muted hover:border-primary-700 hover:text-primary-800 transition-colors"
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
