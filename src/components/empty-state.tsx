"use client";

import type React from "react";

import { BookOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-20 h-20 mb-6 rounded-md border border-rule flex items-center justify-center">
        {icon || <BookOpen className="h-8 w-8 text-ink-muted" />}
      </div>
      <h3 className="text-2xl font-semibold tracking-tight text-ink-heading mb-3">
        {title}
      </h3>
      <p className="text-ink-muted max-w-md mb-6">{description}</p>
    </div>
  );
}
