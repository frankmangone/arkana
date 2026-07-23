"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUnsubscribeByToken } from "@/lib/api/hooks/useSubscriptions";
import { useDictionary } from "@/lib/hooks/use-dictionary";

type Status = "loading" | "success" | "error";

export function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const dictionary = useDictionary("en");
  const unsubscribeByToken = useUnsubscribeByToken();
  const [status, setStatus] = useState<Status>("loading");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    const sid = searchParams.get("sid");
    const token = searchParams.get("token");

    if (!sid || !token) {
      setStatus("error");
      return;
    }

    unsubscribeByToken
      .mutateAsync({ subscriberId: Number(sid), token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        {status === "loading" && (
          <p className="text-ink-body">
            {dictionary?.subscribe.unsubscribe.loading || "Unsubscribing..."}
          </p>
        )}
        {status === "success" && (
          <h1 className="text-2xl font-semibold text-ink-heading">
            {dictionary?.subscribe.unsubscribe.success ||
              "You've been unsubscribed."}
          </h1>
        )}
        {status === "error" && (
          <h1 className="text-2xl font-semibold text-ink-heading">
            {dictionary?.subscribe.unsubscribe.error ||
              "This link is invalid or expired."}
          </h1>
        )}
      </div>
    </div>
  );
}
