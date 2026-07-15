"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, LoaderCircle, X } from "lucide-react";
import { useSearch } from "@/lib/api/hooks";
import { withLocalePath, withSiteUrl } from "@/lib/site-config";
import type { Dictionary } from "@/lib/dictionaries";
import type { SearchHit } from "@/lib/api/services/search";
import { useDebouncedValue } from "../hooks/use-debounced-value";

const RESULT_LIMIT = 3;
const DEBOUNCE_MS = 500;

interface HeroSearchProps {
  lang: string;
  dictionary: Dictionary;
}

// Meilisearch wraps matched terms in <em> tags. Render them as styled spans
// instead of injecting HTML.
function renderExcerpt(excerpt: string) {
  return excerpt.split(/<em>(.*?)<\/em>/g).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="text-primary-800 font-semibold not-italic">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function ResultCard({ hit, lang }: { hit: SearchHit; lang: string }) {
  return (
    <Link
      href={withLocalePath(lang, `blog/${hit.path}`)}
      className="group flex items-stretch gap-4 transition-colors hover:bg-white/5"
    >
      <div className="relative w-24 shrink-0 self-stretch overflow-hidden border-r border-rule">
        <Image
          src={
            hit.thumbnail
              ? hit.thumbnail.startsWith("http")
                ? hit.thumbnail
                : withSiteUrl(hit.thumbnail)
              : "/placeholder.svg"
          }
          alt={hit.title}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 py-3 pr-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink-heading transition-colors group-hover:text-primary-800">
          {hit.title}
        </h3>
        <p className="line-clamp-2 text-xs text-ink-muted">
          {renderExcerpt(hit.excerpt)}
        </p>
      </div>
    </Link>
  );
}

export function HeroSearch({ lang, dictionary }: HeroSearchProps) {
  const [term, setTerm] = useState("");

  const query = useDebouncedValue(term, DEBOUNCE_MS);
  const { data, isFetching } = useSearch({
    query,
    lang,
    limit: RESULT_LIMIT,
  });

  const showPanel = term.trim().length > 0;
  const hits = data?.hits ?? [];
  // Loading spans the debounce window too, not just the fetch itself -
  // otherwise the input feels dead between the first keystroke and the
  // debounced request firing.
  const loading =
    showPanel && (term.trim() !== query.trim() || isFetching);

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-on-brand/70" />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setTerm("");
          }}
          placeholder={dictionary.search.placeholder}
          aria-label={dictionary.search.placeholder}
          className="h-14 w-full rounded-md border-2 border-ink-on-brand/40 bg-white/10 pl-12 pr-11 text-base text-ink-on-brand placeholder:text-ink-on-brand/60 transition-colors hover:border-ink-on-brand/70 focus:border-ink-on-brand focus:bg-white/25 focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
        />
        {loading ? (
          <LoaderCircle className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-ink-on-brand" />
        ) : (
          term.length > 0 && (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] text-ink-on-brand/70 transition-colors hover:bg-black/10 hover:text-ink-on-brand"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 divide-y divide-rule overflow-hidden rounded-md border border-rule bg-surface-overlay">
          {hits.length > 0 ? (
            hits.map((hit) => <ResultCard key={hit.id} hit={hit} lang={lang} />)
          ) : (
            <p className="px-4 py-3 text-sm text-ink-muted">
              {loading
                ? dictionary.search.searching
                : dictionary.search.noResults.replace("{term}", query.trim())}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
