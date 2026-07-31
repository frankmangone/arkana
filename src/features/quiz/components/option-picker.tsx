"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { LatexText } from "@/components/ui/latex-text";
import { useQuestionAnswer } from "@/features/quiz/lib/answer-context";
import { shuffled } from "@/features/quiz/lib/shuffle";
import { cn } from "@/lib/utils";
import type { ChoiceAnswerKey, ChoiceOption } from "@/features/quiz/types";

interface OptionPickerProps {
  hint?: string;
  options: ChoiceOption[];
  allowMultiple: boolean;
}

const styles = {
  wrapper: "flex flex-col gap-4",
  hint: "text-xs text-ink-faint italic",
  list: "flex list-none flex-wrap gap-2 !p-0",
  listItem: "!m-0 basis-full before:!content-none md:basis-[calc(50%-0.25rem)]",
  option: (revealed: boolean, isSelected: boolean, isCorrectOption: boolean) => cn(
    "flex h-full w-full items-center gap-3 rounded-md border border-rule bg-surface-raised px-4 py-2.5 text-left text-[15px] leading-snug text-ink-body transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    revealed
      ? "cursor-default"
      : isSelected
        ? "cursor-pointer"
        : "cursor-pointer hover:border-rule-strong hover:text-ink-heading",
    !revealed &&
      isSelected &&
      "border-primary-700 bg-primary-700/10 text-ink-heading",
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
  marker: (allowMultiple: boolean, isSelected: boolean) => cn(
    "size-2 shrink-0 border transition-colors",
    allowMultiple ? "rotate-45" : "rounded-full",
    isSelected
      ? "border-primary-700 bg-primary-700/80"
      : "border-rule-strong bg-transparent"
  ),
  optionLabel: "flex-1",
  // Always rendered so the reveal check/X doesn't reflow the label text.
  iconSlot: "flex size-4 shrink-0 items-center justify-center",
};

/** Shared option-picking core behind single- and multi-choice questions. */
export function OptionPicker({
  hint,
  options,
  allowMultiple,
}: OptionPickerProps) {
  const { revealed, correct, correctReveal, reportResponse } = useQuestionAnswer();
  // Shuffled once per mount (i.e. per question) so options don't always
  // appear in the same order the content was authored in.
  const [order] = useState(() => shuffled(options));
  const [selected, setSelected] = useState<string[]>([]);

  // On a correct submission the backend never sends the answer key back -
  // there's nothing to leak, since the user's own picks already equal it.
  const correctOptionIds = correct
    ? selected
    : (correctReveal as ChoiceAnswerKey | undefined)?.correctOptionIds ?? [];

  const toggleOption = (optionId: string) => {
    if (revealed) return;

    const next = allowMultiple
      ? selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId]
      : [optionId];
    setSelected(next);
    reportResponse({
      response: { selectedOptionIds: next },
      canSubmit: next.length > 0,
    });
  };

  return (
    <div className={styles.wrapper}>
      {hint && <p className={styles.hint}>{hint}</p>}
      <ul className={styles.list}>
        {order.map((option) => {
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
                <span className={styles.iconSlot} aria-hidden="true">
                  {revealed && isCorrectOption && (
                    <Check className="size-4" strokeWidth={3} />
                  )}
                  {revealed && isSelected && !isCorrectOption && (
                    <X className="size-4" strokeWidth={3} />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
