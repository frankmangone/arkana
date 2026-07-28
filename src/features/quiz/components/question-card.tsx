"use client";

import { useState } from "react";
import {
  Boxes,
  Circle,
  Link2,
  ListChecks,
  ListOrdered,
  PencilLine,
  Scale,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatexText } from "@/components/ui/latex-text";
import { DifficultyPill } from "@/features/quiz/components/difficulty-pill";
import { GlyphRail } from "@/features/quiz/components/glyph-rail";
import { QuestionRenderer } from "@/features/quiz/components/question-renderer";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  Question,
  QuizzesDictionary,
} from "@/features/quiz/types";

// Same soft-glow formula the buy-me-coffee widget uses for its accent
// shadow (0 4px 40px -8px, ~25% alpha). Correct is teal-600, incorrect is
// magenta-600 — each its own lane, distinct from primary/secondary's violet.
const STATUS_SHADOW: Record<AnswerStatus, string> = {
  idle: "",
  correct: "shadow-[0_4px_40px_-8px_hsla(195,92%,60%,0.35)]",
  incorrect: "shadow-[0_4px_40px_-8px_hsla(312,92%,60%,0.35)]",
};

const TYPE_ICONS: Record<Question["type"], LucideIcon> = {
  single_choice: Circle,
  multi_choice: ListChecks,
  matching: Link2,
  range: SlidersHorizontal,
  sequencing: ListOrdered,
  this_vs_that: Scale,
  bucket_sort: Boxes,
  fill_blank: PencilLine,
};

interface QuestionCardProps {
  question: Question;
  dictionary: QuizzesDictionary;
}

export function QuestionCard({ question, dictionary }: QuestionCardProps) {
  const [status, setStatus] = useState<AnswerStatus>("idle");
  const TypeIcon = TYPE_ICONS[question.type];

  return (
    <Card
      className={cn(
        "relative gap-4 overflow-hidden transition-[box-shadow,border-color] duration-500 ease-out",
        status === "correct" && "border-teal-400",
        status === "incorrect" && "border-magenta-400",
        STATUS_SHADOW[status]
      )}
    >
      <GlyphRail status={status} layout="band" />
      <GlyphRail status={status} layout="rail" />
      <DifficultyPill
        difficulty={question.difficulty}
        label={dictionary.difficulty[`${question.difficulty}`]}
        className="absolute top-6 right-6 z-10"
      />
      <CardHeader className="md:pr-24">
        <span className="eyebrow inline-flex items-center gap-2">
          <TypeIcon className="size-3.5" aria-hidden="true" />
          {dictionary.types[question.type]}
        </span>
        <CardTitle className="pr-20 text-lg leading-snug text-ink-heading">
          <LatexText inline>{question.prompt}</LatexText>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 md:pr-24">
        <QuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={setStatus}
        />
      </CardContent>
    </Card>
  );
}
