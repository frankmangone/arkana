"use client";

import { useState } from "react";
import { LatexText } from "@/components/ui/latex-text";
import { Slider } from "@/components/ui/slider";
import type { ResponseReport } from "@/features/quiz/lib/answer-context";
import { useQuestionAnswer } from "@/features/quiz/lib/answer-context";
import { cn } from "@/lib/utils";
import type { QuizzesDictionary, RangeAnswerKey, RangeQuestion } from "@/features/quiz/types";

interface RangeQuestionProps {
  question: RangeQuestion;
  dictionary: QuizzesDictionary;
}

function initialRangeValues(question: RangeQuestion): Record<string, number> {
  return Object.fromEntries(
    question.ranges.map((range) => [range.id, range.min])
  );
}

/**
 * The card's seed for this type - the sliders already have a valid
 * (range-start) value from mount, so "check answer" should be enabled
 * immediately rather than waiting for a first interaction.
 */
export function initialRangeReport(question: RangeQuestion): ResponseReport {
  return {
    response: { values: initialRangeValues(question) },
    canSubmit: true,
  };
}

const styles = {
  wrapper: "flex flex-col gap-6 pb-8",
  hint: "text-xs text-ink-faint italic",
  row: "flex flex-col gap-2",
  labelRow: "flex items-center justify-between gap-4 text-[15px] leading-snug",
  label: "text-ink-body",
  value: (revealed: boolean, passes: boolean | null) => cn(
    "font-mono text-[15px] font-medium text-ink-heading",
    revealed && (passes ? "text-teal" : "text-magenta")
  ),
  slider: (revealed: boolean, passes: boolean | null) => cn(
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
  const { revealed, correct, correctReveal, reportResponse } = useQuestionAnswer();
  const [values, setValues] = useState<Record<string, number>>(() =>
    initialRangeValues(question)
  );

  // On a correct submission the backend never sends the answer key back -
  // the user's own values already pass every tolerance check.
  const correctValues = correct
    ? undefined
    : (correctReveal as RangeAnswerKey | undefined)?.correctValues;

  const setValue = (rangeId: string, value: number) => {
    const next = { ...values, [rangeId]: value };
    setValues(next);
    reportResponse({
      response: { values: next },
      canSubmit: true,
    });
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>{dictionary.rangeHint}</p>
      {question.ranges.map((range) => {
        const value = values[range.id];
        const want = correctValues?.[range.id];
        const passes = revealed ? (correct ? true : want !== undefined && Math.abs(value - want.value) <= want.tolerance) : null;
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
              // Locked (not dimmed) once graded - Radix's own disabled
              // styling fades to 50% opacity, which muddies the teal/
              // magenta grading color; inline style beats that on specificity.
              style={revealed ? { opacity: 1 } : undefined}
              className={styles.slider(revealed, passes)}
            />
            {revealed && !passes && want && (
              <span className={styles.correctValueHint}>
                {dictionary.correctValue.replace(
                  "{value}",
                  `${want.value}${want.tolerance ? ` ± ${want.tolerance}` : ""}${unitSuffix}`
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
