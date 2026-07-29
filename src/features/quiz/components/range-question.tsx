"use client";

import { useState } from "react";
import { LatexText } from "@/components/ui/latex-text";
import { Slider } from "@/components/ui/slider";
import {
  useQuestionAnswer,
  type AnswerReport,
} from "@/features/quiz/lib/answer-context";
import { cn } from "@/lib/utils";
import type { QuizzesDictionary, RangeQuestion } from "@/features/quiz/types";

interface RangeQuestionProps {
  question: RangeQuestion;
  dictionary: QuizzesDictionary;
}

function passesTolerance(value: number, correctValue: number, tolerance: number) {
  return Math.abs(value - correctValue) <= tolerance;
}

function snapToStep(value: number, min: number, step: number) {
  return min + Math.round((value - min) / step) * step;
}

function initialRangeValues(question: RangeQuestion): Record<string, number> {
  return Object.fromEntries(
    question.ranges.map((range) => [
      range.id,
      snapToStep((range.min + range.max) / 2, range.min, range.step),
    ])
  );
}

function isRangeCorrect(question: RangeQuestion, values: Record<string, number>) {
  return question.ranges.every((range) =>
    passesTolerance(values[range.id], range.correctValue, range.tolerance)
  );
}

/**
 * The card's seed for this type. The sliders' midpoint start can already sit
 * on the correct values (it does in the key-size fixture), so the starting
 * position is graded for real rather than assumed wrong.
 */
export function initialRangeReport(question: RangeQuestion): AnswerReport {
  return {
    canSubmit: true,
    correct: isRangeCorrect(question, initialRangeValues(question)),
  };
}

const styles = {
  wrapper: "flex flex-col gap-6 pb-8",
  hint: "text-xs text-ink-faint italic",
  row: "flex flex-col gap-2",
  labelRow: "flex items-center justify-between gap-4 text-sm",
  label: "text-ink-body",
  value: (revealed: boolean, passes: boolean) => cn(
    "font-mono text-sm font-medium text-ink-heading",
    revealed && (passes ? "text-teal" : "text-magenta")
  ),
  slider: (revealed: boolean, passes: boolean) => cn(
    revealed &&
      (passes
        ? "[&_[data-slot=slider-range]]:bg-teal [&_[data-slot=slider-thumb]]:border-teal"
        : "[&_[data-slot=slider-range]]:bg-magenta [&_[data-slot=slider-thumb]]:border-magenta")
  ),
  correctValueHint: "text-xs text-ink-faint",
};

export function RangeQuestionRenderer({
  question,
  dictionary,
}: RangeQuestionProps) {
  const { revealed, reportAnswer } = useQuestionAnswer();
  const [values, setValues] = useState<Record<string, number>>(() =>
    initialRangeValues(question)
  );

  const setValue = (rangeId: string, value: number) => {
    const next = { ...values, [rangeId]: value };
    setValues(next);
    reportAnswer({
      canSubmit: true,
      correct: isRangeCorrect(question, next),
    });
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>{dictionary.rangeHint}</p>
      {question.ranges.map((range) => {
        const value = values[range.id];
        const passes = passesTolerance(value, range.correctValue, range.tolerance);
        const unitSuffix = range.unit ? ` ${range.unit}` : "";

        return (
          <div key={range.id} className={styles.row}>
            <div className={styles.labelRow}>
              <span className={styles.label}>
                <LatexText inline>{range.label}</LatexText>
              </span>
              <span className={styles.value(revealed, passes)}>
                {value}
                {unitSuffix}
              </span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([next]) => setValue(range.id, next)}
              min={range.min}
              max={range.max}
              step={range.step}
              disabled={revealed}
              // Locked (not dimmed) once graded — Radix's own disabled
              // styling fades to 50% opacity, which muddies the teal/
              // magenta grading color; inline style beats that on specificity.
              style={revealed ? { opacity: 1 } : undefined}
              className={styles.slider(revealed, passes)}
            />
            {revealed && !passes && (
              <span className={styles.correctValueHint}>
                {dictionary.correctValue.replace(
                  "{value}",
                  `${range.correctValue}${range.tolerance ? ` ± ${range.tolerance}` : ""}${unitSuffix}`
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
