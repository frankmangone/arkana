"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, LoaderCircle } from "lucide-react";
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
      <span key={index} className="text-primary-700 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function ResultCard({ hit, lang }: { hit: SearchHit; lang: string }) {
  console.log(hit);

  return (
    <Link
      href={withLocalePath(lang, `blog/${hit.path}`)}
      className="group flex items-center gap-4 px-4 py-3 hover:bg-primary-500/15 transition-colors lg:items-stretch lg:gap-0 lg:p-0 lg:bg-black/70 lg:backdrop-blur-md lg:border lg:border-primary-500/25 lg:shadow-xl lg:overflow-hidden lg:hover:bg-black/80"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-primary-500/20 lg:h-auto lg:w-[30%] lg:self-stretch">
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
          sizes="(min-width: 1024px) 400px, 56px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-6 lg:py-5">
        <h3 className="text-sm font-bold text-primary-750 group-hover:text-primary-650 transition-colors line-clamp-1 lg:line-clamp-2 lg:text-lg lg:mb-1">
          {hit.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 lg:line-clamp-4 lg:text-sm">
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
    <div className="relative w-full max-w-xl lg:static">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500 pointer-events-none" />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setTerm("");
          }}
          placeholder={dictionary.search.placeholder}
          aria-label={dictionary.search.placeholder}
          className="w-full h-12 bg-white text-gray-900 placeholder:text-gray-400 pl-12 pr-11 text-base border-2 border-transparent focus:border-primary-500 focus:outline-none transition-colors"
        />
        {loading && (
          <LoaderCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500 animate-spin" />
        )}
      </div>

      {showPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 z-20 md:top-0 md:left-full md:right-auto md:mt-0 md:ml-8 md:w-96 lg:top-24 lg:left-[60%] lg:right-8 lg:ml-0 lg:w-auto xl:left-[47%] bg-black/70 backdrop-blur-md border border-primary-500/25 shadow-xl divide-y divide-white/10 lg:flex lg:flex-col lg:gap-3 lg:divide-y-0 lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:shadow-none">
          {hits.length > 0 ? (
            hits.map((hit) => <ResultCard key={hit.id} hit={hit} lang={lang} />)
          ) : (
            <p className="px-4 py-3 text-sm text-gray-400 lg:bg-black/70 lg:backdrop-blur-md lg:border lg:border-primary-500/25 lg:shadow-xl">
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
