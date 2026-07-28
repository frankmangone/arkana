"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LatexText } from "@/components/ui/latex-text";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  ChoiceOption,
  QuizzesDictionary,
} from "@/features/quiz/types";

interface OptionPickerProps {
  hint?: string;
  options: ChoiceOption[];
  correctOptionIds: string[];
  allowMultiple: boolean;
  explanation?: string;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

function isCorrectSelection(selected: string[], correctIds: string[]) {
  return (
    selected.length === correctIds.length &&
    correctIds.every((id) => selected.includes(id))
  );
}

/** Shared option-picking/grading core behind single- and multi-choice questions. */
export function OptionPicker({
  hint,
  options,
  correctOptionIds,
  allowMultiple,
  explanation,
  dictionary,
  onStatusChange,
}: OptionPickerProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  const correct = isCorrectSelection(selected, correctOptionIds);

  const toggleOption = (optionId: string) => {
    if (revealed) return;

    if (allowMultiple) {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelected([optionId]);
    }
  };

  const toggleRevealed = () => {
    const next = !revealed;
    setRevealed(next);
    if (!next) setSelected([]);
    onStatusChange?.(next ? (correct ? "correct" : "incorrect") : "idle");
  };

  return (
    <div className="flex flex-col gap-4">
      {hint && <p className="text-xs text-ink-faint italic">{hint}</p>}
      <ul className="flex list-none flex-wrap gap-2 !p-0">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isCorrectOption = correctOptionIds.includes(option.id);

          return (
            <li
              key={option.id}
              className="!m-0 basis-full before:!content-none md:basis-[calc(50%-0.25rem)]"
            >
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleOption(option.id)}
                className={cn(
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
                )}
              >
                {/* "What did I pick?" — stays violet, unchanged by grading,
                    so your actual choice is never overwritten by the
                    verdict. Shape carries the other distinction: a circle
                    (radio) reads as "pick one," a diamond (checkbox) reads
                    as "pick any number" — no need to spell either out in
                    the prompt copy. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 border transition-colors",
                    allowMultiple ? "rotate-45" : "rounded-full",
                    isSelected
                      ? "border-primary-700 bg-primary-700/80"
                      : "border-rule-strong bg-transparent"
                  )}
                />
                <span className="flex-1">
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
      <Button
        type="button"
        size="sm"
        className="self-start bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800"
        disabled={!revealed && selected.length === 0}
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
          {!correct && explanation && (
            <p className="text-sm text-ink-body">
              <LatexText inline>{explanation}</LatexText>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
