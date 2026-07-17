import { SocialLinks } from "@/components/social-links";
import type { Writer } from "@/lib/writers";
import type { PostPreview } from "@/lib/posts";
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

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: writer.name,
    url: withSiteUrl(withLocalePath(lang, `writers/${writer.slug}`)),
    image: withSiteUrl(writer.avatarUrl),
    ...(writer.bio?.[lang] ? { description: writer.bio[lang] } : {}),
    ...(writer.organization
      ? {
          worksFor: {
            "@type": "Organization",
            name: writer.organization.name,
            url: writer.organization.url,
          },
        }
      : {}),
    sameAs: Object.values(writer.social ?? {}).filter((link) =>
      link.startsWith("http")
    ),
  };

  return (
    <div className="container pb-8 mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Full-bleed vivid hero field */}
      <header className="full-bleed brand-hero mb-12">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-8 md:px-6 md:pb-20 lg:px-8">
          <Breadcrumbs
            lang={lang}
            items={[
              {
                label: dictionary.writers.title,
                href: withLocalePath(lang, "writers"),
              },
              { label: writer.name },
            ]}
            variant="onBrand"
            className="mb-12 md:mb-16"
          />

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start lg:gap-12">
            <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-full border-2 border-rule-on-brand md:h-44 md:w-44">
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
              <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:justify-start [&_svg]:text-ink-on-brand-soft">
                <h1 className="display-title !text-[clamp(2.5rem,4.5vw,4rem)] text-ink-on-brand-title">
                  {writer.name}
                </h1>

                {/* Organization badge - if writer has organization info */}
                <div className="text-ink-on-brand">
                  {hasOrganization ? (
                    <OrganizationBadge
                      name={writer.organization?.name ?? ""}
                      url={writer.organization?.url ?? ""}
                      logoUrl={writer.organization?.logoUrl ?? ""}
                    />
                  ) : (
                    <OrganizationBadge
                      name="SpaceDev"
                      url="https://spacedev.io"
                      logoUrl="/images/spacedev-logo.png"
                    />
                  )}
                </div>
              </div>

              <WriterArkanaStrip
                content={writer.name}
                lineColor="hsl(260, 60%, 18%)"
                className="md:justify-start flex-shrink-0 mb-6"
              />

              {/* Writer's bio/description */}
              {writer.bio && writer.bio[lang as keyof typeof writer.bio] && (
                <div className="mb-8">
                  <p className="max-w-2xl text-lg leading-relaxed text-ink-on-brand-soft md:text-xl">
                    {writer.bio[lang as keyof typeof writer.bio]}
                  </p>
                </div>
              )}

              <div className="[&_[data-slot=button]]:border-rule-on-brand [&_[data-slot=button]]:bg-white/10 [&_[data-slot=button]]:text-ink-on-brand [&_[data-slot=button]:hover]:bg-white/25">
                <SocialLinks author={writer} />
              </div>
            </div>
          </div>
        </div>
      </header>

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
