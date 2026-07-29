"use client";

import { useState } from "react";
import {
  Boxes,
  Circle,
  Link2,
  ListChecks,
  ListOrdered,
  PencilLine,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatexText } from "@/components/ui/latex-text";
import {
  EMPTY_ANSWER_REPORT,
  QuestionAnswerProvider,
  type AnswerReport,
} from "@/features/quiz/lib/answer-context";
import { DifficultyPill } from "@/features/quiz/components/difficulty-pill";
import { GlyphRail } from "@/features/quiz/components/glyph-rail";
import { QuestionRenderer } from "@/features/quiz/components/question-renderer";
import { initialRangeReport } from "@/features/quiz/components/range-question";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  Question,
  QuizzesDictionary,
} from "@/features/quiz/types";
import { QUESTION_TYPES } from "../lib/enums";

const TYPE_ICONS: Record<Question["type"], LucideIcon> = {
  single_choice: Circle,
  multi_choice: ListChecks,
  matching: Link2,
  range: SlidersHorizontal,
  sequencing: ListOrdered,
  bucket_sort: Boxes,
  fill_blank: PencilLine,
};

const styles = {
  // Same soft-glow formula the buy-me-coffee widget uses for its accent
  // shadow (0 4px 40px -8px, ~25% alpha). Correct is teal-600, incorrect is
  // magenta-600 — each its own lane, distinct from primary/secondary's violet.
  wrapper: (status: AnswerStatus) => cn(
    "relative gap-4 overflow-hidden transition-[box-shadow,border-color] duration-500 ease-out",
    status === "correct" && "border-teal-400 shadow-[0_4px_40px_-8px_hsla(195,92%,60%,0.35)]",
    status === "incorrect" && "border-magenta-400 shadow-[0_4px_40px_-8px_hsla(312,92%,60%,0.35)]"
  ),
  difficultyPill: "absolute top-6 right-6 z-10",
  questionType: "eyebrow inline-flex items-center gap-2",
  questionPrompt: "pr-20 text-lg leading-snug text-ink-heading",
  contentWrapper: "flex flex-col gap-4 pt-0",
  submitButton: "w-48 max-w-full bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800",
  result: "flex flex-col gap-2 border-t border-rule pt-4",
  resultTitle: (correct: boolean) => cn(
    "text-md font-medium",
    correct ? "text-teal" : "text-magenta"
  ),
  resultFeedback: "text-sm text-ink-body"
}

// What the card can know about each type's answer before the user has
// touched anything — after that, every interaction pushes a fresh report
// through context.
function initialAnswerReport(question: Question): AnswerReport {
  switch (question.type) {
    case QUESTION_TYPES.RANGE:
      // Sliders start at their midpoints, which may already be the correct
      // values — grade the starting position for real instead of assuming
      // it's wrong.
      return initialRangeReport(question);
    case QUESTION_TYPES.SEQUENCING:
      // Always reorderable, and the initial shuffle is guaranteed unsolved.
      return { canSubmit: true, correct: question.steps.length < 2 };
    default:
      // Everything else needs at least one interaction before it can be
      // submitted.
      return EMPTY_ANSWER_REPORT;
  }
}

interface QuestionCardProps {
  question: Question;
  dictionary: QuizzesDictionary;
  /**
   * Whether the user can un-reveal and retry after checking their answer.
   * A property of the surrounding context (dev sandbox vs. a real graded
   * quiz attempt), not of the question itself — defaults to on since that's
   * today's only caller (the sandbox).
   */
  allowRetry?: boolean;
}

export function QuestionCard({
  question,
  dictionary,
  allowRetry = true,
}: QuestionCardProps) {
  const [report, setReport] = useState<AnswerReport>(() =>
    initialAnswerReport(question)
  );
  const [revealed, setRevealed] = useState(false);
  const TypeIcon = TYPE_ICONS[question.type];

  const status: AnswerStatus = !revealed
    ? "idle"
    : report.correct
      ? "correct"
      : "incorrect";

  const toggleRevealed = () => {
    if (revealed) report.onRetry?.();
    setRevealed(!revealed);
  };

  const buttonText = revealed
    ? report.correct
      ? dictionary.reset
      : dictionary.tryAgain
    : dictionary.checkAnswer;

  const showButton = !revealed || allowRetry;

  return (
    <Card className={styles.wrapper(status)}>
      <GlyphRail status={status} layout="band" />
      <DifficultyPill
        difficulty={question.difficulty}
        label={dictionary.difficulty[`${question.difficulty}`]}
        className={styles.difficultyPill}
      />
      <CardHeader>
        <span className={styles.questionType}>
          <TypeIcon className="size-3.5" aria-hidden="true" />
          {dictionary.types[question.type]}
        </span>
        <CardTitle className={styles.questionPrompt}>
          <LatexText inline>{question.prompt}</LatexText>
        </CardTitle>
      </CardHeader>

      <CardContent className={styles.contentWrapper}>
        <QuestionAnswerProvider value={{ revealed, reportAnswer: setReport }}>
          <QuestionRenderer question={question} dictionary={dictionary} />
        </QuestionAnswerProvider>
        {showButton && (
          <Button
            type="button"
            size="lg"
            className={styles.submitButton}
            disabled={!revealed && !report.canSubmit}
            onClick={toggleRevealed}
          >
            {buttonText}
          </Button>
        )}
        {revealed && (
          <div className={styles.result}>
            <span className={styles.resultTitle(report.correct)}>
              {report.correct ? dictionary.correct : dictionary.incorrect}
            </span>
            {!report.correct && question.explanation && (
              <p className={styles.resultFeedback}>
                <LatexText inline>{question.explanation}</LatexText>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
