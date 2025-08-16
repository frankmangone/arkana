import { getPostBySlug } from "@/features/posts/actions";
import { PostPreview } from "@/lib/posts";
import { ReadingList, ReadingListItem } from "@/lib/reading-lists";
import { Post } from "@/lib/types";
import { getWriter } from "@/lib/writers";

interface GetPostsFromReadingListParams {
  readingList: ReadingList;
  lang: string;
}

export async function getPostsFromReadingList(
  params: GetPostsFromReadingListParams
) {
  const { readingList, lang } = params;

  const postsWithNulls = await Promise.all(
    (readingList.items as ReadingListItem[])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(async (item) => {
        const post = (await getPostBySlug(item.slug, lang)) as Post;

        // Skip posts that don't exist
        if (!post) {
          return null;
        }

        const author = await getWriter(post.metadata.author);

        return {
          slug: item.slug,
          description: post.metadata.description ?? "",
          title: post.metadata.title,
          date: post.metadata.date,
          tags: post.metadata.tags,
          author: {
            name: author.name,
            slug: author.slug,
          },
          readingTime: post.metadata.readingTime,
          thumbnail: post.metadata.thumbnail,
        } as PostPreview;
      })
  );

  // Filter out null posts
  return postsWithNulls.filter((post): post is PostPreview => post !== null);
}
