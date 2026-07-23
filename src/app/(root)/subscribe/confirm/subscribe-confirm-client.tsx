"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useConfirmSubscription } from "@/lib/api/hooks/useSubscriptions";
import { useDictionary } from "@/lib/hooks/use-dictionary";

type Status = "loading" | "success" | "error";

export function SubscribeConfirmClient() {
  const searchParams = useSearchParams();
  const dictionary = useDictionary("en");
  const confirmSubscription = useConfirmSubscription();
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

    confirmSubscription
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
            {dictionary?.subscribe.confirm.loading ||
              "Confirming your subscription..."}
          </p>
        )}
        {status === "success" && (
          <h1 className="text-2xl font-semibold text-ink-heading">
            {dictionary?.subscribe.confirm.success || "You're subscribed!"}
          </h1>
        )}
        {status === "error" && (
          <h1 className="text-2xl font-semibold text-ink-heading">
            {dictionary?.subscribe.confirm.error ||
              "This link is invalid or expired."}
          </h1>
        )}
      </div>
    </div>
  );
}
