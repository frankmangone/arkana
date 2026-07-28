"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  MultiChoiceQuestion,
  QuizzesDictionary,
  SingleChoiceQuestion,
} from "@/features/quiz/types";

interface ChoiceQuestionProps {
  question: SingleChoiceQuestion | MultiChoiceQuestion;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

function isCorrectSelection(selected: string[], correctIds: string[]) {
  return (
    selected.length === correctIds.length &&
    correctIds.every((id) => selected.includes(id))
  );
}

export function ChoiceQuestionRenderer({
  question,
  dictionary,
  onStatusChange,
}: ChoiceQuestionProps) {
  const allowMultiple = question.type === "multi_choice";
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  const correct = isCorrectSelection(selected, question.correctOptionIds);

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
      <ul className="flex list-none flex-wrap gap-2 !p-0">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isCorrectOption = question.correctOptionIds.includes(option.id);

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
                  "flex h-full w-full items-center gap-3 rounded-md border border-rule px-4 py-2.5 text-left text-sm text-ink-body transition-colors outline-none",
                  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  revealed
                    ? "cursor-default"
                    : "hover:border-rule-strong hover:text-ink-heading",
                  !revealed &&
                    isSelected &&
                    "border-primary-700 bg-primary-700/10 text-ink-heading",
                  revealed &&
                    isSelected &&
                    isCorrectOption &&
                    "border-aquamarine bg-aquamarine-50 text-ink-heading",
                  revealed &&
                    !isSelected &&
                    isCorrectOption &&
                    "border-dashed border-aquamarine-400 text-ink-heading",
                  revealed &&
                    isSelected &&
                    !isCorrectOption &&
                    "border-salmon bg-salmon-50"
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
                <span className="flex-1">{option.label}</span>
                {/* "Was it right?" — a separate icon channel, not just
                    color, so the verdict reads without relying on hue. */}
                {revealed && isCorrectOption && (
                  <span
                    aria-hidden="true"
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-aquamarine-400"
                  >
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  </span>
                )}
                {revealed && isSelected && !isCorrectOption && (
                  <span
                    aria-hidden="true"
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-salmon-600"
                  >
                    <X className="size-3.5 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
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
          <span
            className={cn(
              "text-xs font-medium",
              correct ? "text-aquamarine-600" : "text-ink-muted"
            )}
          >
            {correct ? dictionary.correct : dictionary.incorrect}
          </span>
        )}
      </div>
    </div>
  );
}
