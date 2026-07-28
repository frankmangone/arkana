"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LatexText } from "@/components/ui/latex-text";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  QuizzesDictionary,
  RangeQuestion,
} from "@/features/quiz/types";

interface RangeQuestionProps {
  question: RangeQuestion;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

function passesTolerance(value: number, correctValue: number, tolerance: number) {
  return Math.abs(value - correctValue) <= tolerance;
}

function snapToStep(value: number, min: number, step: number) {
  return min + Math.round((value - min) / step) * step;
}

export function RangeQuestionRenderer({
  question,
  dictionary,
  onStatusChange,
}: RangeQuestionProps) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      question.ranges.map((range) => [
        range.id,
        snapToStep((range.min + range.max) / 2, range.min, range.step),
      ])
    )
  );
  const [revealed, setRevealed] = useState(false);

  const correct = question.ranges.every((range) =>
    passesTolerance(values[range.id], range.correctValue, range.tolerance)
  );

  const toggleRevealed = () => {
    const next = !revealed;
    setRevealed(next);
    onStatusChange?.(next ? (correct ? "correct" : "incorrect") : "idle");
  };

  return (
    <div className="flex flex-col gap-6 md:pr-6">
      <p className="text-xs text-ink-faint italic">{dictionary.rangeHint}</p>
      {question.ranges.map((range) => {
        const value = values[range.id];
        const passes = passesTolerance(value, range.correctValue, range.tolerance);
        const unitSuffix = range.unit ? ` ${range.unit}` : "";

        return (
          <div key={range.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-ink-body">
                <LatexText inline>{range.label}</LatexText>
              </span>
              <span
                className={cn(
                  "font-mono text-sm font-medium text-ink-heading",
                  revealed && (passes ? "text-teal" : "text-magenta")
                )}
              >
                {value}
                {unitSuffix}
              </span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([next]) =>
                setValues((prev) => ({ ...prev, [range.id]: next }))
              }
              min={range.min}
              max={range.max}
              step={range.step}
              disabled={revealed}
              // Locked (not dimmed) once graded — Radix's own disabled
              // styling fades to 50% opacity, which muddies the teal/
              // magenta grading color; inline style beats that on specificity.
              style={revealed ? { opacity: 1 } : undefined}
              className={cn(
                revealed &&
                  (passes
                    ? "[&_[data-slot=slider-range]]:bg-teal [&_[data-slot=slider-thumb]]:border-teal"
                    : "[&_[data-slot=slider-range]]:bg-magenta [&_[data-slot=slider-thumb]]:border-magenta")
              )}
            />
            {revealed && !passes && (
              <span className="text-xs text-ink-faint">
                {dictionary.correctValue.replace(
                  "{value}",
                  `${range.correctValue}${range.tolerance ? ` ± ${range.tolerance}` : ""}${unitSuffix}`
                )}
              </span>
            )}
          </div>
        );
      })}
      <Button
        type="button"
        size="sm"
        className="self-start bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800"
        onClick={toggleRevealed}
      >
        {revealed
          ? correct
            ? dictionary.reset
            : dictionary.tryAgain
          : dictionary.checkAnswer}
      </Button>
      {revealed && (
        <div className="flex flex-col gap-2 border-t border-rule pt-4">
          <span
            className={cn(
              "text-xs font-medium",
              correct ? "text-teal" : "text-magenta"
            )}
          >
            {correct ? dictionary.correct : dictionary.incorrect}
          </span>
          {!correct && question.explanation && (
            <p className="text-sm text-ink-body">
              <LatexText inline>{question.explanation}</LatexText>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
