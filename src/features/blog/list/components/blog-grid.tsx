"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { PostPreview } from "@/lib/posts";
import { PostCard } from "@/components/ui/post-card";
import { Pagination } from "@/components/pagination";
import { useTagFilteredPosts } from "@/lib/api/hooks";
import { TagFilter, type TagFilterLabels } from "./tag-filter";

interface BlogGridLabels extends TagFilterLabels {
  searching: string;
  noPosts: string;
  tryDifferentTag: string;
  viewAllPosts: string;
}

interface BlogGridProps {
  lang: string;
  /** Full corpus, for mapping search hits to previews and as an offline fallback. */
  allPosts: PostPreview[];
  /** The statically paginated slice shown when no tags are selected. */
  pagePosts: PostPreview[];
  currentPage: number;
  totalPages: number;
  labels: BlogGridLabels;
}

function parseTagsParam(): string[] {
  const raw = new URLSearchParams(window.location.search).get("tags");
  if (!raw) return [];
  return [...new Set(raw.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

function writeTagsParam(tags: string[]) {
  const url = new URL(window.location.href);
  if (tags.length > 0) {
    url.searchParams.set("tags", tags.join(","));
  } else {
    url.searchParams.delete("tags");
  }
  window.history.replaceState(null, "", url.toString());
}

export function BlogGrid(props: BlogGridProps) {
  const { lang, allPosts, pagePosts, currentPage, totalPages, labels } = props;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Deep links: tags clicked anywhere land on /blog/page/1?tags=<a,b>. The
  // static HTML renders the unfiltered grid; the filter applies on mount.
  useEffect(() => {
    const tags = parseTagsParam();
    if (tags.length > 0) {
      setSelectedTags(tags);
      setFiltersOpen(true);
    }
  }, []);

  const { data, isFetching, isError } = useTagFilteredPosts({
    tags: selectedTags,
    lang,
  });

  const previewsBySlug = useMemo(
    () => new Map(allPosts.map((post) => [post.slug, post])),
    [allPosts]
  );

  const setTags = (tags: string[]) => {
    setSelectedTags(tags);
    writeTagsParam(tags);
  };
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) setTags([...selectedTags, tag]);
  };
  const removeTag = (tag: string) => {
    setTags(selectedTags.filter((t) => t !== tag));
  };

  // Three sources, in order: static page slice (no filter), search hits
  // mapped back to build-time previews, and — if the API is unreachable —
  // filtering the shipped corpus locally so tags still work offline.
  const filtering = selectedTags.length > 0;
  let shownPosts: PostPreview[];
  if (!filtering) {
    shownPosts = pagePosts;
  } else if (data && !isError) {
    shownPosts = data.hits
      .map((hit) => previewsBySlug.get(hit.path))
      .filter((post): post is PostPreview => post !== undefined);
  } else if (isError) {
    shownPosts = allPosts.filter((post) =>
      selectedTags.every((tag) => post.tags.includes(tag))
    );
  } else {
    shownPosts = [];
  }

  const loading = filtering && !data && !isError;

  return (
    <>
      <TagFilter
        lang={lang}
        selectedTags={selectedTags}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        open={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        labels={labels}
      />

      {loading ? (
        <p className="flex items-center gap-2 py-12 text-ink-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {labels.searching}
        </p>
      ) : shownPosts.length > 0 ? (
        <>
          <div
            className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity ${
              filtering && isFetching ? "opacity-60" : ""
            }`}
          >
            {shownPosts.map((post) => (
              <PostCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>

          {/* Static pagination only applies to the unfiltered corpus; a
              filtered view shows every match at once */}
          {!filtering && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/${lang}/blog`}
            />
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-xl font-semibold text-ink-heading">
            {labels.noPosts}
          </h3>
          <p className="mb-6 text-ink-muted">{labels.tryDifferentTag}</p>
          <button
            type="button"
            onClick={() => setTags([])}
            className="inline-block cursor-pointer rounded-[4px] border border-rule-strong px-6 py-3 text-ink-body transition-colors hover:border-primary-700 hover:text-ink-heading"
          >
            {labels.viewAllPosts}
          </button>
        </div>
      )}
    </>
  );
}
