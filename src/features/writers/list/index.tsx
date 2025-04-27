import Link from "next/link";
import Image from "next/image";
import { Writer } from "@/lib/writers";
import { EmptyState } from "@/components/empty-state";

interface WritersPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
  lang: string;
  writers: Writer[];
}

export function WritersPage(props: WritersPageProps) {
  const { lang, dictionary, writers } = props;

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-8">{dictionary.writers.title}</h1>
      <p className="text-lg mb-10 text-gray-600 dark:text-gray-300">
        {dictionary.writers.description}
      </p>

      {writers.length === 0 && (
        <EmptyState
          title={dictionary.writers.noWriters}
          description={dictionary.writers.noWritersDescription}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {writers.map((writer) => (
          <div
            key={writer.slug}
            className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
              {writer.imageUrl ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${
                    writer.imageUrl
                  }`}
                  alt={writer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <span className="text-xl">No image</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <Link
                href={`/${lang}/writers/${writer.slug}`}
                className="block mb-2"
              >
                <h2 className="text-xl font-semibold hover:text-blue-500 transition-colors">
                  {writer.name}
                </h2>
              </Link>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {writer.bio?.[lang] || ""}
              </p>
              <div className="flex space-x-4 mt-2">
                {writer.social?.twitter && (
                  <a
                    href={writer.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-500"
                  >
                    Twitter
                  </a>
                )}
                {writer.social?.github && (
                  <a
                    href={writer.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-500"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
