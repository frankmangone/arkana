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
      <div className="w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
        {icon || <BookOpen className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
    </div>
  );
}
