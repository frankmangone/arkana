import { SocialLinks } from "@/components/social-links";
import { Writer } from "@/lib/writers";
import { PostPreview } from "@/lib/posts";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { WriterArkanaStrip } from "@/features/writers/view/components/writer-arkana-strip";
import { PostCard } from "@/components/post-card";
import { Pagination } from "@/components/pagination";

interface WriterPageProps {
  lang: string;
  writer: Writer;
  articles: PostPreview[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
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
  return (
    <div className="container py-8 max-w-8xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 mx-auto md:mx-0">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}${writer.avatarUrl}`}
            alt={writer.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold">{writer.name}</h1>
            <WriterArkanaStrip
              content={writer.name}
              className="flex-shrink-0"
            />
          </div>

          <div className="text-muted-foreground mb-6">
            <p className="mb-4">{writer.bio?.[lang]}</p>
          </div>

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
          <h3 className="text-xl font-semibold mb-2">
            {dictionary.writers.noPosts}
          </h3>
        </div>
      )}
    </div>
  );
}
