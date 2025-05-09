import { Writer } from "@/lib/writers";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WriterCardProps {
  writer: Writer;
  lang: string;
}

export function WriterCard({ writer, lang }: WriterCardProps) {
  return (
    <div
      key={writer.slug}
      className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md bg-background"
    >
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
        {writer.imageUrl ? (
          <>
            <div className="absolute inset-0">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                  writer.imageUrl
                }`}
                alt={writer.name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-100 transition-opacity" />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-xl">No image</span>
          </div>
        )}
      </div>
      <div className={cn("p-6", writer.imageUrl && "-mt-8 relative z-10")}>
        <Link href={`/${lang}/writers/${writer.slug}`} className="block mb-2">
          <h2 className="text-xl font-semibold text-primary-500 hover:text-primary-600 transition-colors">
            {writer.name}
          </h2>
        </Link>
        <p className="text-muted-foreground mb-4">{writer.bio?.[lang] || ""}</p>
        <div className="flex space-x-4 mt-2">
          {writer.social?.twitter && (
            <a
              href={writer.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary-500 transition-colors"
            >
              Twitter
            </a>
          )}
          {writer.social?.github && (
            <a
              href={writer.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary-500 transition-colors"
            >
              GitHub
            </a>
          )}
          {writer.social?.medium && (
            <a
              href={writer.social.medium}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary-500 transition-colors"
            >
              Medium
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
