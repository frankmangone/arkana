"use client";

import { useState } from "react";
import { ChevronDown, LoaderCircle, Search, X } from "lucide-react";
import { useTagSearch } from "@/lib/api/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getTagDisplayName } from "@/lib/tags";

const DEBOUNCE_MS = 300;

export interface TagFilterLabels {
  filters: string;
  filterByTag: string;
  searchTags: string;
  noTagsFound: string;
}

interface TagFilterProps {
  lang: string;
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  open: boolean;
  onToggle: () => void;
  labels: TagFilterLabels;
}

/**
 * Collapsible filter section for the blog page. Currently holds a single
 * filter group — tags — with a type-ahead backed by the search API and the
 * selected tags as removable pills. Designed so future filter groups
 * (author, date, ...) can sit alongside the tags group.
 */
export function TagFilter(props: TagFilterProps) {
  const { lang, selectedTags, onAddTag, onRemoveTag, open, onToggle, labels } =
    props;

  const [term, setTerm] = useState("");
  const [focused, setFocused] = useState(false);

  const query = useDebouncedValue(term, DEBOUNCE_MS);
  // An empty query is valid (returns the most-used tags), so the fetch is
  // gated on focus rather than on input length
  const { data, isFetching } = useTagSearch({
    query: query.trim(),
    lang,
    enabled: open && focused,
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
    <section className="mb-10 rounded-md border border-rule">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-white/5"
      >
        <span className="eyebrow flex items-center gap-3 text-ink-muted">
          {labels.filters}
          {selectedTags.length > 0 && (
            <span className="rounded-[3px] border border-primary-700 px-1.5 text-primary-800">
              {selectedTags.length}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-ink-faint transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-rule px-5 py-5">
          {/* Tags group — future filter groups get their own labeled block */}
          <p className="eyebrow mb-3 text-ink-faint">{labels.filterByTag}</p>

          {/* Pills live above the input so the suggestions dropdown never
              covers them */}
          {selectedTags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-[3px] border border-primary-700 py-1 pl-2.5 pr-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-800"
                >
                  {getTagDisplayName(tag, lang)}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    aria-label={`Remove ${getTagDisplayName(tag, lang)}`}
                    className="cursor-pointer rounded-[2px] p-0.5 transition-colors hover:bg-white/10 hover:text-ink-heading"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
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
                      <span className="text-xs text-ink-faint">
                        {hit.count}
                      </span>
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

        </div>
      )}
    </section>
  );
}
