"use client";

import { useState, useEffect, useRef } from "react";
import { articlesService, type ArticleListItem } from "@/lib/supabase";
import { SearchResultCard } from "./search-result-card";

interface StandaloneSearchProps {
  lang: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dictionary: any;
}

export function StandaloneSearch({ lang, dictionary }: StandaloneSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setShowResults(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await articlesService.searchArticles(term, {
        searchType: "full_text",
        language: lang,
        limit: 4,
      });
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If empty, clear immediately without debounce
    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      setLoading(false);
      return;
    }

    // Show loading immediately when user starts typing
    setLoading(true);

    // Debounce search for non-empty values
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setShowResults(false);
    setLoading(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show results if we have a search term and results
    if (searchTerm.trim() && results.length > 0) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 150);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="w-full py-2">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-8xl relative">
        {/* Search Container with Popover */}
        <div className="flex justify-start w-[30%]">
          <div ref={searchContainerRef} className="relative w-full max-w-2xl">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={
                    dictionary.search.placeholder || "Search articles..."
                  }
                  className={`w-full px-6 py-4 pr-16 text-lg bg-white text-gray-900 border-2 transition-colors focus:outline-none shadow-lg ${
                    isFocused ? "border-primary-500" : "border-gray-200"
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col justify-center items-center h-[40px]">
                  {loading ? (
                    <div className="pr-2 pointer-events-none">
                      <svg
                        className="w-6 h-6 text-primary-500 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  ) : searchTerm ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className={`px-2 flex-1 cursor-pointer transition-all duration-200 ${
                        isFocused
                          ? "text-primary-500 hover:bg-primary-500 hover:text-white"
                          : "text-gray-500 hover:bg-primary-500 hover:text-white"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  ) : (
                    <div className="pr-2 pointer-events-none">
                      <svg
                        className={`w-6 h-6 transition-colors ${
                          isFocused ? "text-primary-500" : "text-gray-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Search Results Popover - Full Width */}
        {showResults && (
          <div
            className="absolute top-[100%] left-4 right-4 md:left-6 md:right-6 lg:left-8 lg:right-8 mt-2 bg-background border-2 border-primary-500/20 shadow-xl z-50 max-h-[600px] overflow-y-auto"
            // style={{ top: "calc(100% + 1rem)" }}
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-primary-500 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <div className="text-gray-600 text-lg">
                  {dictionary.search.searching || "Searching articles..."}
                </div>
              </div>
            ) : results.length === 0 && searchTerm.trim() ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 text-lg">
                  {dictionary.search.noResults?.replace("{term}", searchTerm) ||
                    `No articles found for "${searchTerm}"`}
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results.map((article) => (
                    <div
                      key={article.slug}
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking results
                    >
                      <SearchResultCard article={article} lang={lang} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
