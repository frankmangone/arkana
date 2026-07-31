"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { LatexText } from "@/components/ui/latex-text";
import { useQuestionAnswer } from "@/features/quiz/lib/answer-context";
import { shuffled } from "@/features/quiz/lib/shuffle";
import { cn } from "@/lib/utils";
import type {
  AssignmentsAnswerKey,
  BucketSortQuestion,
  QuizzesDictionary,
} from "@/features/quiz/types";

interface BucketSortQuestionProps {
  question: BucketSortQuestion;
  dictionary: QuizzesDictionary;
}

const SPRING = { type: "spring" as const, stiffness: 700, damping: 40 };
// Sentinel drop-target id for the unsorted pool - distinct from any real
// bucket id (which always comes from the fixture's own `buckets` list).
const POOL = "pool";

const styles = {
  wrapper: "flex flex-col gap-4",
  hint: "text-xs text-ink-faint italic",
  pool: (isDragOver: boolean) => cn(
    "min-h-11 rounded-md border border-dashed border-transparent p-1 transition-colors",
    isDragOver && "border-primary-700 bg-primary-700/10"
  ),
  poolList: "flex list-none flex-wrap gap-2 !p-0 !m-0",
  chipItem: "!m-0 before:!content-none",
  chip: (revealed: boolean, isActive: boolean, extra?: string) => cn(
    "rounded-md border border-rule bg-surface-raised px-3 py-1.5 text-left text-[15px] leading-snug text-ink-body transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    revealed
      ? "cursor-default"
      : isActive
        ? "cursor-pointer"
        : "cursor-grab hover:border-rule-strong hover:text-ink-heading active:cursor-grabbing",
    !revealed &&
      isActive &&
      "border-primary-700 bg-primary-700/10 text-ink-heading",
    extra
  ),
  bucketGrid: "grid grid-cols-1 gap-3 md:grid-cols-2",
  bucket: (revealed: boolean, hasActiveItem: boolean, isDragOver: boolean) => cn(
    "flex min-h-28 flex-col gap-2 rounded-md border border-dashed border-rule p-3 transition-colors",
    !revealed &&
      hasActiveItem &&
      !isDragOver &&
      "cursor-pointer border-primary-700/50 hover:border-primary-700",
    isDragOver && "border-primary-700 bg-primary-700/10"
  ),
  bucketLabel: "text-sm font-semibold text-ink-heading",
  bucketList: "flex list-none flex-wrap flex-row gap-2 !p-0",
  bucketChipExtra: (revealed: boolean, isCorrect: boolean) => cn(
    "flex items-center gap-1.5",
    revealed && isCorrect && "border-teal bg-teal/10 text-ink-heading",
    revealed && !isCorrect && "border-magenta bg-magenta/10"
  ),
};

export function BucketSortQuestionRenderer({
  question,
  dictionary,
}: BucketSortQuestionProps) {
  const { revealed, correct, correctReveal, reportResponse } = useQuestionAnswer();
  const [order] = useState(() => shuffled(question.items));
  // itemId -> bucketId; absent means still in the unsorted pool.
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // On a correct submission the backend never sends the answer key back -
  // the user's own assignments already equal it.
  const correctAssignments = correct
    ? assignments
    : (correctReveal as AssignmentsAnswerKey | undefined)?.correctAssignments ?? {};

  const placeItem = (itemId: string, bucketId: string | null) => {
    if (revealed) return;
    const next = { ...assignments };
    if (bucketId) next[itemId] = bucketId;
    else delete next[itemId];

    setAssignments(next);
    reportResponse({
      response: { assignments: next },
      canSubmit: question.items.every((item) => next[item.id]),
    });
  };

  const selectItem = (itemId: string) => {
    if (revealed) return;
    setActiveItemId((prev) => (prev === itemId ? null : itemId));
  };

  // Click path: item first, then wherever it goes - bucket containers (and
  // the pool) are all valid targets for whichever item is currently active.
  const dropInto = (bucketId: string | null) => {
    if (revealed || !activeItemId) return;
    placeItem(activeItemId, bucketId);
    setActiveItemId(null);
  };

  // Drag path: same destinations, but driven by native HTML5 drag-and-drop
  // instead of a click-then-click round trip.
  const handleDragOverTarget = (event: React.DragEvent, target: string) => {
    if (revealed || !draggedItemId) return;
    event.preventDefault();
    setDragOverTarget(target);
  };

  const handleDropOnTarget = (event: React.DragEvent, bucketId: string | null) => {
    event.preventDefault();
    if (revealed || !draggedItemId) return;
    placeItem(draggedItemId, bucketId);
    setDraggedItemId(null);
    setDragOverTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverTarget(null);
  };

  const pool = order.filter((item) => !assignments[item.id]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>{dictionary.bucketSortHint}</p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => dropInto(null)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") dropInto(null);
        }}
        onDragOver={(event) => handleDragOverTarget(event, POOL)}
        onDrop={(event) => handleDropOnTarget(event, null)}
        className={styles.pool(dragOverTarget === POOL)}
      >
        <ul className={styles.poolList}>
          {pool.map((item) => (
            <motion.li
              key={item.id}
              layout
              transition={SPRING}
              className={styles.chipItem}
            >
              <button
                type="button"
                aria-pressed={activeItemId === item.id}
                disabled={revealed}
                draggable={!revealed}
                onDragStart={(event) => {
                  event.stopPropagation();
                  setDraggedItemId(item.id);
                }}
                onDragEnd={handleDragEnd}
                onClick={(event) => {
                  event.stopPropagation();
                  selectItem(item.id);
                }}
                className={styles.chip(revealed, activeItemId === item.id)}
              >
                <LatexText inline>{item.label}</LatexText>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className={styles.bucketGrid}>
        {question.buckets.map((bucket) => {
          const bucketItems = order.filter(
            (item) => assignments[item.id] === bucket.id
          );

          return (
            <div
              key={bucket.id}
              role="button"
              tabIndex={0}
              onClick={() => dropInto(bucket.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ")
                  dropInto(bucket.id);
              }}
              onDragOver={(event) => handleDragOverTarget(event, bucket.id)}
              onDrop={(event) => handleDropOnTarget(event, bucket.id)}
              className={styles.bucket(
                revealed,
                Boolean(activeItemId),
                dragOverTarget === bucket.id
              )}
            >
              <span className={styles.bucketLabel}>
                <LatexText inline>{bucket.label}</LatexText>
              </span>
              <ul className={styles.bucketList}>
                {bucketItems.map((item) => {
                  const isCorrect = correctAssignments[item.id] === bucket.id;

                  return (
                    <motion.li
                      key={item.id}
                      layout
                      transition={SPRING}
                      className={styles.chipItem}
                    >
                      <button
                        type="button"
                        aria-pressed={activeItemId === item.id}
                        disabled={revealed}
                        draggable={!revealed}
                        onDragStart={(event) => {
                          event.stopPropagation();
                          setDraggedItemId(item.id);
                        }}
                        onDragEnd={handleDragEnd}
                        onClick={(event) => {
                          event.stopPropagation();
                          selectItem(item.id);
                        }}
                        className={styles.chip(
                          revealed,
                          activeItemId === item.id,
                          styles.bucketChipExtra(revealed, isCorrect)
                        )}
                      >
                        <LatexText inline>{item.label}</LatexText>
                        <span
                          className="flex size-3.5 shrink-0 items-center justify-center"
                          aria-hidden="true"
                        >
                          {revealed &&
                            (isCorrect ? (
                              <Check className="size-3.5" strokeWidth={3} />
                            ) : (
                              <X className="size-3.5" strokeWidth={3} />
                            ))}
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
