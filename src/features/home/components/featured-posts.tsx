import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getFeaturedPosts } from "@/lib/blog";

interface FeaturedPostsProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export async function FeaturedPosts({ lang, dictionary }: FeaturedPostsProps) {
  const posts = await getFeaturedPosts(lang);

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">
          {dictionary.home.featuredPosts.title}
        </h2>
        <Link href={`/${lang}/blog`}>
          <Button variant="outline">
            {dictionary.home.featuredPosts.viewAll}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="line-clamp-2">
                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/${lang}/blog?tag=${tag}`}>
                    <Badge variant="secondary">{tag}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                <span>{formatDate(post.date, lang)}</span>
                <span>
                  {post.readingTime} {dictionary.blog.readingTime}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
