import { SocialLinks } from "@/components/social-links";
import type { Writer } from "@/lib/writers";
import type { PostPreview } from "@/lib/posts";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { WriterArkanaStrip } from "@/features/writers/view/components/writer-arkana-strip";
import { PostCard } from "@/components/ui/post-card";
import { Pagination } from "@/components/pagination";
import { OrganizationBadge } from "./components/organization-badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import { withLocalePath, withSiteUrl } from "@/lib/site-config";

interface WriterPageProps {
  lang: string;
  writer: Writer;
  articles: PostPreview[];
  dictionary: Dictionary;
  currentPage?: number;
  totalPages?: number;
}

export default function WriterPage({
  lang,
  writer,
  articles,
  dictionary,
  currentPage = 1,
  totalPages = 1,
}: WriterPageProps) {
  // Assuming the writer object might have an organization field
  const hasOrganization = writer.organization?.name && writer.organization?.url;

  return (
    <div className="container py-8 mx-auto">
      <Breadcrumbs
        lang={lang}
        items={[
          {
            label: dictionary.writers.title,
            href: withLocalePath(lang, "writers"),
          },
          { label: writer.name },
        ]}
        className="mb-8"
      />
      <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 mx-auto md:mx-0">
          <Image
            src={
              writer.avatarUrl
                ? withSiteUrl(writer.avatarUrl)
                : "/placeholder.svg"
            }
            alt={writer.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="w-full flex-1 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-heading">
              {writer.name}
            </h1>

            {/* Organization badge - if writer has organization info */}
            {hasOrganization && (
              <OrganizationBadge
                name={writer.organization?.name ?? ""}
                url={writer.organization?.url ?? ""}
                logoUrl={writer.organization?.logoUrl ?? ""}
              />
            )}

            {/* Fallback for SpaceDev if no organization is specified */}
            {!hasOrganization && (
              <OrganizationBadge
                name="SpaceDev"
                url="https://spacedev.io"
                logoUrl="/images/spacedev-logo.png" // You'll need to add this logo to your public folder
              />
            )}
          </div>

          <WriterArkanaStrip
            content={writer.name}
            className="md:justify-start flex-shrink-0 mb-6"
          />

          {/* Writer's bio/description */}
          {writer.bio && writer.bio[lang as keyof typeof writer.bio] && (
            <div className="mb-6">
              <p className="text-lg text-ink-muted leading-relaxed max-w-2xl">
                {writer.bio[lang as keyof typeof writer.bio]}
              </p>
            </div>
          )}

          <SocialLinks author={writer} />
        </div>
      </div>

      <Separator className="my-8" />

      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((post) => (
              <PostCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>

          {/* Only show pagination if we have more than one page */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/${lang}/writers/${writer.slug}`}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-ink-heading mb-2">
            {dictionary.writers.noArticlesInLanguage.title}
          </h3>
          <p className="text-ink-muted mb-6">
            {dictionary.writers.noArticlesInLanguage.description}
          </p>
          <Link
            href={withLocalePath(lang)}
            className="inline-flex items-center justify-center rounded-[4px] bg-[image:var(--grad-brand)] px-6 py-3 font-medium text-white transition-[filter] hover:brightness-110"
          >
            {dictionary.writers.noArticlesInLanguage.button}
          </Link>
        </div>
      )}
    </div>
  );
}
