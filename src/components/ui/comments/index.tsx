"use client";

import { useComments } from "@/lib/api/hooks/usePosts";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import { useWallet } from "@/components/providers/wallet-provider";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { useDictionary } from "@/lib/hooks/use-dictionary";

interface CommentSectionProps {
  path: string;
}

export function CommentSection({ path }: CommentSectionProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = (params?.lang as string) || "en";
  const { wallet } = useWallet();
  const { data, isLoading, error } = useComments({ path });
  const dictionary = useDictionary(lang);
  const [showTooltip, setShowTooltip] = useState(false);
  const shouldFocus = searchParams.get("focus") === "comment";

  // Clear the focus parameter after focusing
  useEffect(() => {
    if (shouldFocus && wallet) {
      // Remove the focus parameter from URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("focus");
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
      router.replace(newUrl);
    }
  }, [shouldFocus, wallet, searchParams, router]);

  const handleLoginRedirect = () => {
    router.push(
      `/${lang}/login?redirect=${encodeURIComponent(window.location.pathname)}`
    );
  };

  const latexHelpText = dictionary?.comments?.form
    ? `${dictionary.comments.form.supportsLatex} $...$ ${dictionary.comments.form.forInlineMath}`
    : "Supports LaTeX: use $...$ for inline math.";

  return (
    <section id="comments" className="mt-12 scroll-mt-20">
      <div className="flex items-center gap-2 mb-6 relative">
        <h2 className="text-2xl font-semibold">Comments</h2>
        <div className="relative flex items-center">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="flex items-center justify-center text-secondary-600 hover:text-secondary-700 transition-colors"
            aria-label="LaTeX help"
          >
            <Info className="w-5 h-5" />
          </button>
          {showTooltip && (
            <div className="absolute left-0 top-6 z-10 w-64 p-3 bg-background border border-border rounded-none shadow-lg text-xs text-white">
              {latexHelpText}
            </div>
          )}
        </div>
      </div>

      {/* Comment Form */}
      {wallet ? (
        <CommentForm path={path} walletAddress={wallet.address} autoFocus={shouldFocus} />
      ) : (
        <div className="mb-8 p-4 border border-border rounded-none bg-muted/30">
          <p className="text-secondary-600 text-sm space-y-4">
            <button
              onClick={handleLoginRedirect}
              className="text-primary hover:underline font-medium"
            >
              Connect your wallet
            </button>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading && (
        <div className="text-secondary-500 text-sm">Loading comments...</div>
      )}

      {error && (
        <div className="text-red-500 text-sm">
          Failed to load comments. Please try again later.
        </div>
      )}

      {data && <CommentList comments={data.comments} path={path} />}
    </section>
  );
}
