"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shuffled } from "@/features/quiz/lib/shuffle";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  QuizzesDictionary,
  SequencingQuestion,
} from "@/features/quiz/types";

interface SequencingQuestionProps {
  question: SequencingQuestion;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

export function SequencingQuestionRenderer({
  question,
  dictionary,
  onStatusChange,
}: SequencingQuestionProps) {
  const correctOrder = question.steps.map((step) => step.id);

  const [order, setOrder] = useState<string[]>(() => {
    if (correctOrder.length < 2) return correctOrder;
    let arrangement = shuffled(correctOrder);
    if (arrangement.join() === correctOrder.join()) {
      arrangement = shuffled(correctOrder);
    }
    return arrangement;
  });
  const [revealed, setRevealed] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const stepsById = new Map(question.steps.map((step) => [step.id, step]));
  const correct = order.join() === correctOrder.join();

  const moveStep = (index: number, direction: -1 | 1) => {
    if (revealed) return;
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleDrop = (targetIndex: number) => {
    if (revealed || draggedId === null) return;
    setOrder((prev) => {
      const from = prev.indexOf(draggedId);
      if (from === -1 || from === targetIndex) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(targetIndex, 0, draggedId);
      return next;
    });
    setDraggedId(null);
  };

  const toggleRevealed = () => {
    const next = !revealed;
    setRevealed(next);
    onStatusChange?.(next ? (correct ? "correct" : "incorrect") : "idle");
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-faint italic">{dictionary.sequencingHint}</p>
      <ol className="flex list-none flex-col gap-2 !p-0">
        {order.map((id, index) => {
          const step = stepsById.get(id);
          if (!step) return null;
          const isCorrectPosition = correctOrder[index] === id;

          return (
            <li
              key={id}
              className="!m-0 before:!content-none"
              draggable={!revealed}
              onDragStart={() => setDraggedId(id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
            >
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md border border-rule bg-surface-raised px-3 py-2.5 text-sm text-ink-body transition-colors",
                  !revealed && "cursor-grab active:cursor-grabbing",
                  revealed &&
                    isCorrectPosition &&
                    "border-teal bg-teal/10 text-ink-heading",
                  revealed &&
                    !isCorrectPosition &&
                    "border-magenta bg-magenta/10"
                )}
              >
                <GripVertical
                  className={cn(
                    "size-4 shrink-0 text-ink-faint",
                    revealed && "opacity-40"
                  )}
                  aria-hidden="true"
                />
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-700/15 text-xs font-semibold text-ink-heading">
                  {index + 1}
                </span>
                <span className="flex-1">{step.label}</span>
                {!revealed && (
                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => moveStep(index, -1)}
                      className="cursor-pointer text-ink-faint outline-none transition-colors hover:text-ink-heading focus-visible:text-ink-heading disabled:pointer-events-none disabled:cursor-default disabled:opacity-30"
                    >
                      <ChevronUp className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={index === order.length - 1}
                      onClick={() => moveStep(index, 1)}
                      className="cursor-pointer text-ink-faint outline-none transition-colors hover:text-ink-heading focus-visible:text-ink-heading disabled:pointer-events-none disabled:cursor-default disabled:opacity-30"
                    >
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
                {revealed && isCorrectPosition && (
                  <Check className="size-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                )}
                {revealed && !isCorrectPosition && (
                  <X className="size-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          size="sm"
          className="bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800"
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
              correct ? "text-teal" : "text-magenta"
            )}
          >
            {correct ? dictionary.correct : dictionary.incorrect}
          </span>
        )}
      </div>
      {revealed && !correct && question.explanation && (
        <p className="text-sm text-ink-body">{question.explanation}</p>
      )}
    </div>
  );
}
