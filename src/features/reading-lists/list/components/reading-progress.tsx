"use client";

import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useReadStatuses } from "@/lib/api";

interface ReadingProgressProps {
  slugs: string[];
  readLabel: string;
}

export function ReadingProgress(props: ReadingProgressProps) {
  const { slugs, readLabel } = props;
  const { user } = useAuth();

  const { data: readStatuses } = useReadStatuses({
    paths: slugs,
    enabled: !!user,
  });

  if (!user || !readStatuses) {
    return null;
  }

  const readCount = slugs.filter((slug) => readStatuses[slug]).length;

  return (
    <span className="inline-flex items-center">
      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
      {readCount}/{slugs.length} {readLabel}
    </span>
  );
}
