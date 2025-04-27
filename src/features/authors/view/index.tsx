import { SocialLinks } from "@/components/social-links";
import { Writer } from "@/lib/writers";
import { PostPreview } from "@/lib/posts";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { WriterArticles } from "@/features/writers/view/components/writer-articles";

interface AuthorPageProps {
  lang: string;
  writer: Writer;
  articles: PostPreview[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export default function AuthorPage(props: AuthorPageProps) {
  const { lang, writer, articles, dictionary } = props;
  // const dict = await getDictionary(lang);
  // const posts = await getPostsByAuthor(author.id, params.lang);

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden flex-shrink-0 mx-auto md:mx-0">
          <Image
            src={writer.imageUrl}
            alt={writer.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{writer.name}</h1>

          <div className="text-muted-foreground mb-6">
            <p className="mb-4">{writer.bio?.[lang]}</p>
          </div>

          <SocialLinks author={writer} />
        </div>
      </div>

      <Separator className="my-8" />

      <WriterArticles
        lang={lang}
        articles={articles}
        writerName={writer.name}
        dictionary={dictionary}
      />

      {/* <div>
          <h2 className="text-2xl font-bold mb-6">
            {dict.author.articlesBy.replace("{name}", author.name)}
          </h2>
  
          <PostList posts={posts} lang={params.lang} dictionary={dict} />
        </div> */}
    </div>
  );
}
