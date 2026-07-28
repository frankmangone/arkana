"use client";

import { useState } from "react";
import {
  Circle,
  Compass,
  Link2,
  ListChecks,
  ListOrdered,
  Scale,
  SearchX,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
// shadow (0 4px 40px -8px, ~25% alpha), just swapped to the aquamarine/
// salmon pair the quiz already grades with instead of coffee's coral.
const STATUS_SHADOW: Record<AnswerStatus, string> = {
  idle: "",
  correct: "shadow-[0_4px_40px_-8px_hsla(165,65%,60%,0.35)]",
  incorrect: "shadow-[0_4px_40px_-8px_hsla(5,85%,70%,0.35)]",
};

const TYPE_ICONS: Record<Question["type"], LucideIcon> = {
  single_choice: Circle,
  multi_choice: ListChecks,
  matching: Link2,
  range: SlidersHorizontal,
  sequencing: ListOrdered,
  scenario: Compass,
  spot_the_flaw: SearchX,
  this_vs_that: Scale,
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
        "relative overflow-hidden transition-[box-shadow,border-color] duration-500 ease-out",
        status === "correct" && "border-aquamarine",
        status === "incorrect" && "border-salmon",
        STATUS_SHADOW[status]
      )}
    >
      <GlyphRail status={status} layout="band" />
      <GlyphRail status={status} layout="rail" />
      <CardHeader className="md:pr-24">
        <div className="flex items-center justify-between gap-4">
          <span className="eyebrow inline-flex items-center gap-2">
            <TypeIcon className="size-3.5" aria-hidden="true" />
            {dictionary.types[question.type]}
          </span>
          <DifficultyPill
            difficulty={question.difficulty}
            label={dictionary.difficulty[`${question.difficulty}`]}
          />
        </div>
        <CardTitle className="text-lg leading-snug text-ink-heading">
          {question.prompt}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 md:pr-24">
        <QuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={setStatus}
        />
      </CardContent>
    </Card>
  );
}
