"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { LatexText } from "@/components/ui/latex-text";
import {
  EMPTY_ANSWER_REPORT,
  useQuestionAnswer,
} from "@/features/quiz/lib/answer-context";
import { cn } from "@/lib/utils";
import type { ChoiceOption } from "@/features/quiz/types";

interface OptionPickerProps {
  hint?: string;
  options: ChoiceOption[];
  correctOptionIds: string[];
  allowMultiple: boolean;
}

function isCorrectSelection(selected: string[], correctIds: string[]) {
  return (
    selected.length === correctIds.length &&
    correctIds.every((id) => selected.includes(id))
  );
}

const styles = {
  wrapper: "flex flex-col gap-4",
  hint: "text-xs text-ink-faint italic",
  list: "flex list-none flex-wrap gap-2 !p-0",
  listItem: "!m-0 basis-full before:!content-none md:basis-[calc(50%-0.25rem)]",
  option: (revealed: boolean, isSelected: boolean, isCorrectOption: boolean) => cn(
    "flex h-full w-full items-center gap-3 rounded-md border border-rule bg-surface-raised px-4 py-2.5 text-left text-sm text-ink-body transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    revealed
      ? "cursor-default"
      : isSelected
        ? "cursor-pointer"
        : "cursor-pointer hover:border-rule-strong hover:text-ink-heading",
    !revealed &&
      isSelected &&
      "border-primary-700 bg-primary-700/10 text-ink-heading",
    // Grading colors sit closer to the house palette than the
    // old widget's aquamarine/salmon: teal for correct,
    // magenta for incorrect — both their own lane, distinct
    // from primary/secondary's violet.
    revealed &&
      isSelected &&
      isCorrectOption &&
      "border-teal bg-teal/10 text-ink-heading",
    revealed &&
      !isSelected &&
      isCorrectOption &&
      "border-dashed border-teal-400 text-ink-heading",
    revealed &&
      isSelected &&
      !isCorrectOption &&
      "border-magenta bg-magenta/10"
  ),
  // "What did I pick?" — stays violet, unchanged by grading, so your actual
  // choice is never overwritten by the verdict. Shape carries the other
  // distinction: a circle (radio) reads as "pick one," a diamond (checkbox)
  // reads as "pick any number" — no need to spell either out in the prompt copy.
  marker: (allowMultiple: boolean, isSelected: boolean) => cn(
    "size-2 shrink-0 border transition-colors",
    allowMultiple ? "rotate-45" : "rounded-full",
    isSelected
      ? "border-primary-700 bg-primary-700/80"
      : "border-rule-strong bg-transparent"
  ),
  optionLabel: "flex-1",
};

/** Shared option-picking/grading core behind single- and multi-choice questions. */
export function OptionPicker({
  hint,
  options,
  correctOptionIds,
  allowMultiple,
}: OptionPickerProps) {
  const { revealed, reportAnswer } = useQuestionAnswer();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (optionId: string) => {
    if (revealed) return;

    const next = allowMultiple
      ? selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId]
      : [optionId];
    setSelected(next);
    reportAnswer({
      canSubmit: next.length > 0,
      correct: isCorrectSelection(next, correctOptionIds),
      onRetry: () => {
        setSelected([]);
        reportAnswer(EMPTY_ANSWER_REPORT);
      },
    });
  };

  return (
    <div className={styles.wrapper}>
      {hint && <p className={styles.hint}>{hint}</p>}
      <ul className={styles.list}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isCorrectOption = correctOptionIds.includes(option.id);

          return (
            <li key={option.id} className={styles.listItem}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleOption(option.id)}
                className={styles.option(revealed, isSelected, isCorrectOption)}
              >
                <span
                  aria-hidden="true"
                  className={styles.marker(allowMultiple, isSelected)}
                />
                <span className={styles.optionLabel}>
                  <LatexText inline>{option.label}</LatexText>
                </span>
                {/* "Was it right?" — a separate icon channel, not just
                    color, so the verdict reads without relying on hue. Bare
                    glyph (no enclosing badge), matching this-vs-that. */}
                {revealed && isCorrectOption && (
                  <Check
                    className="size-4 shrink-0"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                )}
                {revealed && isSelected && !isCorrectOption && (
                  <X
                    className="size-4 shrink-0"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
