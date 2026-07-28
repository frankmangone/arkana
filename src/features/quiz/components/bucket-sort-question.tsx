"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { LatexText } from "@/components/ui/latex-text";
import { shuffled } from "@/features/quiz/lib/shuffle";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  BucketSortQuestion,
  QuizzesDictionary,
} from "@/features/quiz/types";

interface BucketSortQuestionProps {
  question: BucketSortQuestion;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

const SPRING = { type: "spring" as const, stiffness: 700, damping: 40 };
// Sentinel drop-target id for the unsorted pool — distinct from any real
// bucket id (which always comes from the fixture's own `buckets` list).
const POOL = "pool";

export function BucketSortQuestionRenderer({
  question,
  dictionary,
  onStatusChange,
}: BucketSortQuestionProps) {
  const [order] = useState(() => shuffled(question.items));
  // itemId -> bucketId; absent means still in the unsorted pool.
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const allSorted = question.items.every((item) => assignments[item.id]);
  const correct = question.items.every(
    (item) => assignments[item.id] === item.correctBucketId
  );

  const placeItem = (itemId: string, bucketId: string | null) => {
    if (revealed) return;
    setAssignments((prev) => {
      const next = { ...prev };
      if (bucketId) next[itemId] = bucketId;
      else delete next[itemId];
      return next;
    });
  };

  const selectItem = (itemId: string) => {
    if (revealed) return;
    setActiveItemId((prev) => (prev === itemId ? null : itemId));
  };

  // Click path: item first, then wherever it goes — bucket containers (and
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

  const toggleRevealed = () => {
    const next = !revealed;
    setRevealed(next);
    if (!next) {
      setAssignments({});
      setActiveItemId(null);
    }
    onStatusChange?.(next ? (correct ? "correct" : "incorrect") : "idle");
  };

  const pool = order.filter((item) => !assignments[item.id]);

  const chipClassName = (itemId: string, extra?: string) => {
    const isActive = activeItemId === itemId;
    return cn(
      "rounded-md border border-rule bg-surface-raised px-3 py-1.5 text-left text-sm text-ink-body transition-colors outline-none",
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
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-faint italic">{dictionary.bucketSortHint}</p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => dropInto(null)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") dropInto(null);
        }}
        onDragOver={(event) => handleDragOverTarget(event, POOL)}
        onDrop={(event) => handleDropOnTarget(event, null)}
        className={cn(
          "min-h-11 rounded-md border border-dashed border-transparent p-1 transition-colors",
          dragOverTarget === POOL && "border-primary-700 bg-primary-700/10"
        )}
      >
        <ul className="flex list-none flex-wrap gap-2 !p-0 !m-0">
          {pool.map((item) => (
            <motion.li
              key={item.id}
              layout
              transition={SPRING}
              className="!m-0 before:!content-none"
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
                className={chipClassName(item.id)}
              >
                <LatexText inline>{item.label}</LatexText>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              className={cn(
                "flex min-h-28 flex-col gap-2 rounded-md border border-dashed border-rule p-3 transition-colors",
                !revealed &&
                  activeItemId &&
                  dragOverTarget !== bucket.id &&
                  "cursor-pointer border-primary-700/50 hover:border-primary-700",
                dragOverTarget === bucket.id &&
                  "border-primary-700 bg-primary-700/10"
              )}
            >
              <span className="text-sm font-semibold text-ink-heading">
                <LatexText inline>{bucket.label}</LatexText>
              </span>
              <ul className="flex list-none flex-col gap-2 !p-0">
                {bucketItems.map((item) => {
                  const isCorrect = item.correctBucketId === bucket.id;

                  return (
                    <motion.li
                      key={item.id}
                      layout
                      transition={SPRING}
                      className="!m-0 before:!content-none"
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
                        className={chipClassName(
                          item.id,
                          cn(
                            "flex w-full items-center gap-2",
                            revealed &&
                              isCorrect &&
                              "border-teal bg-teal/10 text-ink-heading",
                            revealed && !isCorrect && "border-magenta bg-magenta/10"
                          )
                        )}
                      >
                        <span className="flex-1">
                          <LatexText inline>{item.label}</LatexText>
                        </span>
                        <span className="flex size-4 shrink-0 items-center justify-center">
                          {revealed &&
                            (isCorrect ? (
                              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                            ) : (
                              <X className="size-4" strokeWidth={3} aria-hidden="true" />
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

      <Button
        type="button"
        size="sm"
        className="self-start bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800"
        disabled={!revealed && !allSorted}
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
