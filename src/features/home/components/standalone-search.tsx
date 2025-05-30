"use client";

import { useState, useEffect, useRef } from "react";
import { articlesService, type ArticleListItem } from "@/lib/supabase";
import Link from "next/link";

interface StandaloneSearchProps {
  lang: string;
}

export function StandaloneSearch({ lang }: StandaloneSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setShowResults(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await articlesService.searchArticles(term, lang, 8);
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

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Search Bar - Matches intro text container width */}
      <section className="w-full py-8">
        <div className="container z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-8xl">
          <div className="z-10 flex-1 flex flex-col justify-center bg-transparent text-left w-full md:max-w-6/10 xl:max-w-4/10">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Search articles..."
                  className={`w-full px-6 py-4 pr-16 text-lg bg-white text-gray-900 border-2 transition-colors focus:outline-none ${
                    isFocused ? "border-primary-500" : "border-white"
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
                          : "text-gray-900 hover:bg-primary-500 hover:text-white"
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
                          isFocused ? "text-primary-500" : "text-gray-900"
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
      </section>

      {/* Search Results - Truly Full Width */}
      {showResults && (
        <section className="w-full bg-gray-950/50 py-12">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-8xl">
            {loading && (
              <div className="text-center py-12">
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
                <div className="text-white text-lg">Searching articles...</div>
              </div>
            )}

            {!loading && results.length === 0 && searchTerm.trim() && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">
                  No articles found for &ldquo;{searchTerm}&rdquo;
                </div>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/${lang}/blog/${article.slug}`}
                      className="group block bg-gray-900 hover:bg-gray-800 transition-colors"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="text-primary-500 text-sm font-medium group-hover:text-primary-400 transition-colors">
                          Read more →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
