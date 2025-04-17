import Link from "next/link";

interface ReadingListCardProps {
  // TODO: Improve this typing
  item: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  index: number;
  lang: string;
  dictionary: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function ReadingListCard(props: ReadingListCardProps) {
  const { item, index, lang } = props;

  return (
    <div
      key={item.slug}
      className="border rounded-lg p-6 transition-all hover:shadow-md"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-16 text-center">
          <div className="mt-1 text-white text-xl font-bold mx-auto">
            {index + 1}
          </div>
        </div>
        <div className="flex-1">
          {item.post && (
            <>
              <Link
                href={`/${lang}/blog/${item.slug}`}
                className="text-2xl font-semibold hover:text-blue-500 mb-2 block"
              >
                {item.post.metadata.title}
              </Link>
              <p className="text-gray-500 mb-4">
                {item.post.metadata.readingTime} read •{" "}
                {new Date(item.post.metadata.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {item.description || item.post.metadata.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.post.metadata.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
