import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  // Generate an array of page numbers to display
  const getVisiblePages = () => {
    // Always show current page
    const pages = [currentPage];

    // Add pages before current page
    let before = currentPage - 1;
    while (before > 0 && pages.length < 3) {
      pages.unshift(before);
      before--;
    }

    // Add pages after current page
    let after = currentPage + 1;
    while (after <= totalPages && pages.length < 5) {
      pages.push(after);
      after++;
    }

    // If we have space, add more pages before
    before = pages[0] - 1;
    while (before > 0 && pages.length < 5) {
      pages.unshift(before);
      before--;
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="mt-12">
      <div className="h-px w-full bg-gray-800 mb-6"></div>
      <nav className="flex items-center justify-between">
        <Link
          href={
            currentPage > 1 ? `${basePath}/page/${currentPage - 1}` : basePath
          }
          className={cn(
            "flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors",
            currentPage === 1 && "pointer-events-none opacity-50"
          )}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Link>

        <div className="flex items-center space-x-1">
          {visiblePages.map((page) => (
            <Link
              key={page}
              href={page === 1 ? basePath : `${basePath}/page/${page}`}
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded text-sm font-medium transition-colors",
                currentPage === page
                  ? "bg-white text-black"
                  : "text-gray-300 hover:text-white"
              )}
            >
              {page}
            </Link>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <>
              <span className="text-gray-500 px-1">...</span>
              <Link
                href={`${basePath}/page/${totalPages}`}
                className="inline-flex items-center justify-center h-8 w-8 rounded text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {totalPages}
              </Link>
            </>
          )}
        </div>

        <Link
          href={
            currentPage < totalPages
              ? `${basePath}/page/${currentPage + 1}`
              : basePath
          }
          className={cn(
            "flex items-center text-sm font-medium text-gray-300 hover:text-white transition-colors",
            currentPage === totalPages && "pointer-events-none opacity-50"
          )}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </nav>
    </div>
  );
}
