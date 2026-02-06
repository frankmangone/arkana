"use client";

import { useComments } from "@/lib/api/hooks/usePosts";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import { useWallet } from "@/components/providers/wallet-provider";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getDictionary } from "@/lib/dictionaries";
import { Info } from "lucide-react";

interface CommentSectionProps {
  path: string;
}

export function CommentSection({ path }: CommentSectionProps) {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const { wallet } = useWallet();
  const { data, isLoading, error } = useComments({ path });
  const [dictionary, setDictionary] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    getDictionary(lang).then(setDictionary);
  }, [lang]);

  const handleLoginRedirect = () => {
    router.push(
      `/${lang}/login?redirect=${encodeURIComponent(window.location.pathname)}`
    );
  };

  const latexHelpText = dictionary?.comments?.form
    ? `${dictionary.comments.form.supportsLatex} $...$ ${dictionary.comments.form.forInlineMath}`
    : "Supports LaTeX: use $...$ for inline math.";

  return (
    <section className="mt-12">
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
        <CommentForm path={path} walletAddress={wallet.address} />
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
