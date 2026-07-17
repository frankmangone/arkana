import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostPreview } from "@/lib/posts";
import { withLocalePath } from "@/lib/site-config";
import { BlogGrid } from "./components/blog-grid";
import type { Dictionary } from "@/lib/dictionaries";

interface BlogPageProps {
  lang: string;
  posts: PostPreview[];
  allPosts: PostPreview[];
  dictionary: Dictionary;
  currentPage?: number;
  totalPages?: number;
  heading?: string;
}

export function BlogPage({
  lang,
  posts,
  allPosts,
  dictionary,
  currentPage = 1,
  totalPages = 1,
  heading,
}: BlogPageProps) {
  return (
    <div className="container pb-8">
      <header className="mb-12 pb-4 pt-8">
        <Breadcrumbs
          lang={lang}
          items={
            heading
              ? [
                  {
                    label: dictionary.blog.title,
                    href: withLocalePath(lang, "blog"),
                  },
                  { label: heading },
                ]
              : [{ label: dictionary.blog.title }]
          }
          className="mb-12"
        />
        <p className="eyebrow mb-4 font-semibold text-ink-faint">
          {dictionary.home.recentPosts.title}
        </p>
        <h1 className="display-title !text-[clamp(2.75rem,6vw,4.75rem)] text-primary-750">
          {heading ?? dictionary.blog.title}
        </h1>
      </header>

      <BlogGrid
        lang={lang}
        allPosts={allPosts}
        pagePosts={posts}
        currentPage={currentPage}
        totalPages={totalPages}
        labels={{
          filters: dictionary.blog.filters,
          filterByTag: dictionary.blog.filterByTag,
          searchTags: dictionary.blog.searchTags,
          noTagsFound: dictionary.blog.noTagsFound,
          searching: dictionary.search.searching,
          noPosts: dictionary.blog.noPosts,
          tryDifferentTag: dictionary.blog.tryDifferentTag,
          viewAllPosts: dictionary.blog.viewAllPosts,
        }}
      />
    </div>
  );
}
