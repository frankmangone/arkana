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
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatexText } from "@/components/ui/latex-text";
import {
  QuestionAnswerProvider,
  type ResponseReport,
} from "@/features/quiz/lib/answer-context";
import { DifficultyPill } from "@/features/quiz/components/difficulty-pill";
import { GlyphRail } from "@/features/quiz/components/glyph-rail";
import { QuestionRenderer } from "@/features/quiz/components/question-renderer";
import { initialRangeReport } from "@/features/quiz/components/range-question";
import { cn } from "@/lib/utils";
import type {
  AnswerKey,
  AnswerStatus,
  CheckAnswer,
  Question,
  QuestionResponse,
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
  // magenta-600 - each its own lane, distinct from primary/secondary's violet.
  wrapper: (status: AnswerStatus) => cn(
    "relative gap-4 overflow-hidden transition-[box-shadow,border-color] duration-500 ease-out",
    status === "correct" && "border-teal-400 shadow-[0_4px_40px_-8px_hsla(195,92%,60%,0.35)]",
    status === "incorrect" && "border-magenta-400 shadow-[0_4px_40px_-8px_hsla(312,92%,60%,0.35)]"
  ),
  difficultyPill: "absolute top-6 right-6 z-10",
  questionType: "eyebrow inline-flex items-center gap-2",
  questionPrompt: "pr-0 sm:pr-20 text-lg leading-snug text-ink-heading",
  contentWrapper: "flex flex-col gap-4 pt-0",
  actionsRow: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
  actionLayout: "w-full sm:w-48 max-w-full",
  // The default action look when no variant override is given - solid
  // primary, overriding the Button default's gradient.
  actionSolid: "bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800",
  // Keeps the right action flush right even when there's no left action.
  rightActionButton: "ml-auto",
  result: "flex flex-col gap-2 border-t border-rule pt-4",
  resultTitle: (correct: boolean) => cn(
    "text-md font-medium",
    correct ? "text-teal" : "text-magenta"
  ),
  resultFeedback: "text-sm text-ink-body"
}

// What the card can know about each type's response before the user has
// touched anything - after that, every interaction pushes a fresh report
// through context.
function initialResponseReport(question: Question): ResponseReport {
  switch (question.type) {
    case QUESTION_TYPES.RANGE:
      // Sliders start at their midpoints - already a submittable value.
      return initialRangeReport(question);
    case QUESTION_TYPES.SEQUENCING:
      // Always reorderable, and the initial (delivered) order is always submittable.
      return { response: { order: question.steps.map((step) => step.id) }, canSubmit: true };
    default:
      // Everything else needs at least one interaction before it can be
      // submitted.
      return { response: {} as QuestionResponse, canSubmit: false };
  }
}

type ActionVariant = VariantProps<typeof buttonVariants>["variant"];

/** One of the card's footer action buttons — either slot can host it. */
export interface QuestionCardAction {
  label: string;
  /**
   * Click handler. Omit to make this the check/retry button: its click runs
   * the card's internal check flow (the response being graded lives inside
   * the card, so the actual handler is the `checkAnswer` prop) and it
   * self-disables while checking, before anything is submittable, or once
   * revealed with retries off.
   */
  onClick?: () => void;
  /** Extra disable on top of a check action's own gating. */
  disabled?: boolean;
  /** Button variant (e.g. "ghost", "outline"). Omit for the solid primary look. */
  variant?: ActionVariant;
  /** Lucide icon rendered after the label. */
  icon?: LucideIcon;
}

interface QuestionCardProps {
  question: Question;
  dictionary: QuizzesDictionary;
  /** Grades a response - locally for the sandbox, via the real API for an attempt. */
  checkAnswer: CheckAnswer;
  /**
   * Whether the user can un-reveal and retry after checking their answer.
   * A property of the surrounding context (dev sandbox vs. a real graded
   * quiz attempt, which never allows retries), not of the question itself.
   */
  allowRetry?: boolean;
  /** Left action button. Omit to render no button in that slot. */
  leftAction?: QuestionCardAction;
  /** Right action button, flush right on the same row. Omit to render none. */
  rightAction?: QuestionCardAction;
  /** Fires once a check resolves - lets the parent switch its actions (e.g.
   * Skip → Continue) once this question is settled. */
  onAnswered?: (correct: boolean) => void;
  /** Fires when a retry resets the card (sandbox only) - lets the parent
   * restore its idle-state action labels. */
  onRetry?: () => void;
}

export function QuestionCard({
  question,
  dictionary,
  checkAnswer,
  allowRetry = true,
  leftAction,
  rightAction,
  onAnswered,
  onRetry,
}: QuestionCardProps) {
  const [report, setReport] = useState<ResponseReport>(() =>
    initialResponseReport(question)
  );
  const [revealed, setRevealed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    correctReveal?: AnswerKey;
    explanation?: string;
  } | null>(null);
  // Bumped on retry so <QuestionRenderer> remounts fresh instead of every
  // renderer needing its own reset-on-retry plumbing.
  const [retryKey, setRetryKey] = useState(0);
  const TypeIcon = TYPE_ICONS[question.type];

  const status: AnswerStatus = !revealed
    ? "idle"
    : result?.correct
      ? "correct"
      : "incorrect";

  const handleClick = async () => {
    if (revealed) {
      // Retry (sandbox only) - remount the renderer fresh and reseed the report.
      setRevealed(false);
      setResult(null);
      setReport(initialResponseReport(question));
      setRetryKey((key) => key + 1);
      onRetry?.();
      return;
    }

    setChecking(true);
    try {
      const outcome = await checkAnswer(report.response);
      setResult({
        correct: outcome.correct,
        correctReveal: outcome.correctReveal,
        explanation: outcome.explanation,
      });
      setRevealed(true);
      onAnswered?.(outcome.correct);
    } finally {
      setChecking(false);
    }
  };

  const renderAction = (action: QuestionCardAction, extraClass?: string) => {
    // No onClick marks the check/retry button — wire it to the internal
    // check flow and layer its gating on top of any parent-supplied disable.
    const isCheck = !action.onClick;
    const disabled =
      !!action.disabled ||
      (isCheck &&
        (checking || (!revealed && !report.canSubmit) || (revealed && !allowRetry)));

    return (
      <Button
        type="button"
        size="lg"
        variant={action.variant}
        className={cn(styles.actionLayout, !action.variant && styles.actionSolid, extraClass)}
        disabled={disabled}
        onClick={action.onClick ?? handleClick}
      >
        {action.label}
        {action.icon && <action.icon aria-hidden="true" />}
      </Button>
    );
  };

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
        <QuestionAnswerProvider
          value={{
            revealed,
            correct: result?.correct,
            correctReveal: result?.correctReveal,
            reportResponse: setReport,
          }}
        >
          <QuestionRenderer key={retryKey} question={question} dictionary={dictionary} />
        </QuestionAnswerProvider>
        {(leftAction || rightAction) && (
          <div className={styles.actionsRow}>
            {leftAction && renderAction(leftAction)}
            {rightAction && renderAction(rightAction, styles.rightActionButton)}
          </div>
        )}
        {revealed && result && (
          <div className={styles.result}>
            <span className={styles.resultTitle(result.correct)}>
              {result.correct ? dictionary.correct : dictionary.incorrect}
            </span>
            {!result.correct && result.explanation && (
              <p className={styles.resultFeedback}>
                <LatexText inline>{result.explanation}</LatexText>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
