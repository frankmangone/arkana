"use client";

import { useState } from "react";
import { LoaderCircle, Tag as TagIcon } from "lucide-react";
import { useTagSearch } from "@/lib/api/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getTagDisplayName } from "@/lib/tags";

const DEBOUNCE_MS = 300;

export interface TagFilterLabels {
  searchTags: string;
  noTagsFound: string;
}

interface TagFilterProps {
  lang: string;
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  labels: TagFilterLabels;
}

/**
 * Tag type-ahead: a search-style input (tag icon, not a lens) with a live
 * dropdown of matching tags, styled to sit beside the free-text search
 * input as one combined form. Selected tags render as pills elsewhere.
 */
export function TagFilter(props: TagFilterProps) {
  const { lang, selectedTags, onAddTag, labels } = props;

  const [term, setTerm] = useState("");
  const [focused, setFocused] = useState(false);

  const query = useDebouncedValue(term, DEBOUNCE_MS);
  // An empty query is valid (returns the most-used tags), so the fetch is
  // gated on focus rather than on input length
  const { data, isFetching } = useTagSearch({
    query: query.trim(),
    lang,
    enabled: focused,
  });

  const suggestions = (data?.tags ?? []).filter(
    (hit) => !selectedTags.includes(hit.tag)
  );
  const loading = focused && (term.trim() !== query.trim() || isFetching);

  const addTag = (tag: string) => {
    onAddTag(tag);
    setTerm("");
  };

  return (
    <div className="relative flex-1">
      <TagIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setTerm("");
            event.currentTarget.blur();
          }
          if (event.key === "Enter" && suggestions.length > 0) {
            event.preventDefault();
            addTag(suggestions[0].tag);
          }
        }}
        placeholder={labels.searchTags}
        aria-label={labels.searchTags}
        className="h-12 w-full rounded-md border-2 border-rule bg-white/5 pl-11 pr-10 text-sm text-ink-body placeholder:text-ink-faint transition-colors hover:border-rule-strong focus:border-primary-700 focus:bg-white/10 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
      />
      {loading && (
        <LoaderCircle className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-faint" />
      )}

      {focused && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 divide-y divide-rule overflow-y-auto rounded-md border border-rule bg-surface-overlay">
          {suggestions.length > 0 ? (
            suggestions.map((hit) => (
              <button
                key={hit.tag}
                type="button"
                // onMouseDown so the pick lands before the input blurs
                onMouseDown={(event) => {
                  event.preventDefault();
                  addTag(hit.tag);
                }}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm text-ink-body transition-colors hover:bg-white/5"
              >
                <span>{getTagDisplayName(hit.tag, lang)}</span>
                <span className="text-xs text-ink-faint">{hit.count}</span>
              </button>
            ))
          ) : (
            <p className="px-4 py-2.5 text-sm text-ink-muted">
              {loading ? "…" : labels.noTagsFound}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
