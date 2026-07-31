"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import { motion } from "motion/react";
import { LatexText } from "@/components/ui/latex-text";
import { useQuestionAnswer } from "@/features/quiz/lib/answer-context";
import { cn } from "@/lib/utils";
import type {
  QuizzesDictionary,
  SequencingAnswerKey,
  SequencingQuestion,
} from "@/features/quiz/types";

interface SequencingQuestionProps {
  question: SequencingQuestion;
  dictionary: QuizzesDictionary;
}

const styles = {
  wrapper: "flex flex-col gap-4",
  hint: "text-xs text-ink-faint italic",
  list: "flex list-none flex-col gap-2 !p-0",
  listItem: "!m-0 before:!content-none",
  row: (revealed: boolean, isCorrectPosition: boolean | null) => cn(
    "flex items-center gap-3 rounded-md border border-rule bg-surface-raised px-3 py-2.5 text-[15px] leading-snug text-ink-body transition-colors",
    !revealed && "cursor-grab active:cursor-grabbing",
    revealed &&
      isCorrectPosition &&
      "border-teal bg-teal/10 text-ink-heading",
    revealed &&
      isCorrectPosition === false &&
      "border-magenta bg-magenta/10"
  ),
  grip: (revealed: boolean) => cn(
    "hidden size-4 shrink-0 text-ink-faint md:block",
    revealed && "opacity-40"
  ),
  label: "flex flex-1 items-baseline gap-1.5",
  index: "font-semibold text-ink-heading",
  // The controls stay mounted (but invisible) after reveal so the row keeps
  // the exact same footprint — the check/X then centers over their space.
  trailing: "relative flex shrink-0 items-center",
  reorderControls: (revealed: boolean) => cn(
    "flex shrink-0 flex-row gap-1 md:-my-2 md:flex-col md:gap-0",
    revealed && "invisible"
  ),
  revealIcon: "absolute inset-0 flex items-center justify-center",
  reorderButton: "cursor-pointer rounded p-2.5 text-ink-faint outline-none transition-colors hover:bg-surface-overlay hover:text-ink-heading focus-visible:text-ink-heading active:bg-surface-overlay disabled:pointer-events-none disabled:cursor-default disabled:opacity-30 md:p-2",
};

export function SequencingQuestionRenderer({
  question,
  dictionary,
}: SequencingQuestionProps) {
  const { revealed, correct, correctReveal, reportResponse } = useQuestionAnswer();
  const [order, setOrder] = useState<string[]>(() => question.steps.map((step) => step.id));
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const stepsById = new Map(question.steps.map((step) => [step.id, step]));

  // On a correct submission the backend never sends the answer key back -
  // the user's own order already equals it.
  const correctOrder = correct
    ? order
    : (correctReveal as SequencingAnswerKey | undefined)?.correctOrder;

  const applyOrder = (next: string[]) => {
    setOrder(next);
    reportResponse({
      response: { order: next },
      canSubmit: true,
    });
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    if (revealed) return;
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    applyOrder(next);
  };

  const handleDrop = (targetIndex: number) => {
    if (revealed || draggedId === null) return;
    setDraggedId(null);
    const from = order.indexOf(draggedId);
    if (from === -1 || from === targetIndex) return;
    const next = [...order];
    next.splice(from, 1);
    next.splice(targetIndex, 0, draggedId);
    applyOrder(next);
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>{dictionary.sequencingHint}</p>
      <ol className={styles.list}>
        {order.map((id, index) => {
          const step = stepsById.get(id);
          if (!step) return null;
          const isCorrectPosition = correctOrder ? correctOrder[index] === id : null;

          return (
            <motion.li
              key={id}
              layout
              transition={{ type: "spring", stiffness: 700, damping: 40 }}
              className={styles.listItem}
            >
              <div
                draggable={!revealed}
                onDragStart={() => setDraggedId(id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(index)}
                className={styles.row(revealed, isCorrectPosition)}
              >
                <GripVertical
                  className={styles.grip(revealed)}
                  aria-hidden="true"
                />
                <span className={styles.label}>
                  <span className={styles.index}>{index + 1}.</span>
                  <LatexText inline>{step.label}</LatexText>
                </span>
                <div className={styles.trailing}>
                  <div className={styles.reorderControls(revealed)}>
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={revealed || index === 0}
                      onClick={() => moveStep(index, -1)}
                      className={styles.reorderButton}
                    >
                      <ChevronUp className="size-5 md:size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={revealed || index === order.length - 1}
                      onClick={() => moveStep(index, 1)}
                      className={styles.reorderButton}
                    >
                      <ChevronDown className="size-5 md:size-4" aria-hidden="true" />
                    </button>
                  </div>
                  {revealed && isCorrectPosition !== null && (
                    <span className={styles.revealIcon} aria-hidden="true">
                      {isCorrectPosition ? (
                        <Check className="size-4" strokeWidth={3} />
                      ) : (
                        <X className="size-4" strokeWidth={3} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
