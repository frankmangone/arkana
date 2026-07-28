"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { shuffled } from "@/features/quiz/lib/shuffle";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  MatchingPair,
  MatchingQuestion,
  QuizzesDictionary,
} from "@/features/quiz/types";

interface MatchingQuestionProps {
  question: MatchingQuestion;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

interface LineSegment {
  leftId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** null while unrevealed — line is neutral until graded. */
  correct: boolean | null;
}

function letterFor(index: number) {
  return String.fromCharCode(65 + index);
}

export function MatchingQuestionRenderer({
  question,
  dictionary,
  onStatusChange,
}: MatchingQuestionProps) {
  const [rightOrder] = useState(() => shuffled(question.pairs));
  // leftPairId -> rightPairId it's currently matched with
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  // leftPairIds in the order they were matched — matched pairs hoist to the
  // top of both columns in this order, landing on the same row, so the
  // connecting line stays short instead of cutting diagonally across rows.
  const [matchOrder, setMatchOrder] = useState<string[]>([]);
  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lines, setLines] = useState<LineSegment[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const leftPairById = new Map(question.pairs.map((pair) => [pair.id, pair]));
  const rightPairById = new Map(rightOrder.map((pair) => [pair.id, pair]));
  const leftIndex = new Map(question.pairs.map((pair, i) => [pair.id, i]));

  const allAnswered = question.pairs.every((pair) => assignments[pair.id]);
  const correct = question.pairs.every(
    (pair) => assignments[pair.id] === pair.id
  );

  const isMatchingPair = (pair: MatchingPair | undefined): pair is MatchingPair =>
    pair !== undefined;

  const leftRenderOrder = [
    ...matchOrder.map((id) => leftPairById.get(id)).filter(isMatchingPair),
    ...question.pairs.filter((pair) => !matchOrder.includes(pair.id)),
  ];
  const rightRenderOrder = [
    ...matchOrder
      .map((id) => rightPairById.get(assignments[id]))
      .filter(isMatchingPair),
    ...rightOrder.filter(
      (pair) => !matchOrder.some((id) => assignments[id] === pair.id)
    ),
  ];

  const selectLeft = (leftId: string) => {
    if (revealed) return;
    setActiveLeftId((prev) => (prev === leftId ? null : leftId));
  };

  const selectRight = (rightId: string) => {
    if (revealed || !activeLeftId) return;
    const leftId = activeLeftId;
    const prevOwner = Object.keys(assignments).find(
      (id) => assignments[id] === rightId
    );

    setAssignments((prev) => {
      const next = { ...prev };
      if (prevOwner) delete next[prevOwner];
      next[leftId] = rightId;
      return next;
    });
    setMatchOrder((prev) => [
      ...prev.filter((id) => id !== leftId && id !== prevOwner),
      leftId,
    ]);
    setActiveLeftId(null);
  };

  const toggleRevealed = () => {
    const next = !revealed;
    setRevealed(next);
    if (!next) {
      setAssignments({});
      setMatchOrder([]);
      setActiveLeftId(null);
    }
    onStatusChange?.(next ? (correct ? "correct" : "incorrect") : "idle");
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recomputeLines = () => {
      const containerRect = container.getBoundingClientRect();
      setLines(
        Object.entries(assignments).flatMap(([leftId, rightId]) => {
          const leftEl = leftRefs.current[leftId];
          const rightEl = rightRefs.current[rightId];
          if (!leftEl || !rightEl) return [];

          const leftRect = leftEl.getBoundingClientRect();
          const rightRect = rightEl.getBoundingClientRect();

          return [
            {
              leftId,
              x1: leftRect.right - containerRect.left,
              y1: leftRect.top + leftRect.height / 2 - containerRect.top,
              x2: rightRect.left - containerRect.left,
              y2: rightRect.top + rightRect.height / 2 - containerRect.top,
              correct: revealed ? leftId === rightId : null,
            },
          ];
        })
      );
    };

    // Reordering animates over the spring transition below — poll for that
    // window so the line tracks the boxes mid-flight instead of jumping
    // straight to their end position.
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      recomputeLines();
      if (now - start < 300) frame = requestAnimationFrame(tick);
    });

    const observer = new ResizeObserver(recomputeLines);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [assignments, revealed]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-faint italic">{dictionary.matchingHint}</p>
      <div
        ref={containerRef}
        className="relative grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3"
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        >
          {lines.map((line) => (
            <line
              key={line.leftId}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              strokeWidth={2}
              strokeLinecap="round"
              stroke="currentColor"
              className={cn(
                "transition-colors",
                line.correct === null && "text-primary-700/50",
                line.correct === true && "text-teal",
                line.correct === false && "text-magenta"
              )}
            />
          ))}
        </svg>
        <ul className="flex list-none flex-col gap-2 !p-0">
          {leftRenderOrder.map((pair) => {
            const isActive = activeLeftId === pair.id;
            const assignedRightId = assignments[pair.id];
            const isMatchCorrect = assignedRightId === pair.id;

            return (
              <motion.li
                key={pair.id}
                layout
                transition={{ type: "spring", stiffness: 700, damping: 40 }}
                className="!m-0 before:!content-none"
              >
                <button
                  ref={(el) => {
                    leftRefs.current[pair.id] = el;
                  }}
                  type="button"
                  aria-pressed={isActive}
                  disabled={revealed}
                  onClick={() => selectLeft(pair.id)}
                  className={cn(
                    "flex min-h-16 w-full items-center gap-2.5 rounded-md border border-rule bg-surface-raised px-3 py-2.5 text-left text-sm text-ink-body transition-colors outline-none",
                    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    revealed
                      ? "cursor-default"
                      : "cursor-pointer hover:border-rule-strong hover:text-ink-heading",
                    !revealed &&
                      isActive &&
                      "border-primary-700 bg-primary-700/10 text-ink-heading",
                    !revealed &&
                      !isActive &&
                      assignedRightId &&
                      "border-primary-700/40 text-ink-heading",
                    revealed &&
                      isMatchCorrect &&
                      "border-teal bg-teal/10 text-ink-heading",
                    revealed &&
                      !isMatchCorrect &&
                      "border-magenta bg-magenta/10"
                  )}
                >
                  {assignedRightId && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-700/15 text-xs font-semibold text-ink-heading">
                      {letterFor(leftIndex.get(pair.id) ?? 0)}
                    </span>
                  )}
                  <span className="flex-1">{pair.left}</span>
                  {revealed && isMatchCorrect && (
                    <Check className="size-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                  )}
                  {revealed && !isMatchCorrect && (
                    <X className="size-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
        <ul className="flex list-none flex-col gap-2 !p-0">
          {rightRenderOrder.map((rightPair) => {
            const matchedLeftId = Object.keys(assignments).find(
              (leftId) => assignments[leftId] === rightPair.id
            );
            const isMatched = matchedLeftId !== undefined;
            const isMatchCorrect = matchedLeftId === rightPair.id;

            return (
              <motion.li
                key={rightPair.id}
                layout
                transition={{ type: "spring", stiffness: 700, damping: 40 }}
                className="!m-0 before:!content-none"
              >
                <button
                  ref={(el) => {
                    rightRefs.current[rightPair.id] = el;
                  }}
                  type="button"
                  disabled={revealed}
                  onClick={() => selectRight(rightPair.id)}
                  className={cn(
                    "flex min-h-16 w-full items-center gap-2.5 rounded-md border border-rule bg-surface-raised px-3 py-2.5 text-left text-sm text-ink-body transition-colors outline-none",
                    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    revealed
                      ? "cursor-default"
                      : "cursor-pointer hover:border-rule-strong hover:text-ink-heading",
                    !revealed &&
                      isMatched &&
                      "border-primary-700/40 text-ink-heading",
                    revealed &&
                      isMatched &&
                      isMatchCorrect &&
                      "border-teal bg-teal/10 text-ink-heading",
                    revealed &&
                      isMatched &&
                      !isMatchCorrect &&
                      "border-magenta bg-magenta/10"
                  )}
                >
                  {isMatched && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-700/15 text-xs font-semibold text-ink-heading">
                      {letterFor(leftIndex.get(matchedLeftId) ?? 0)}
                    </span>
                  )}
                  <span className="flex-1">{rightPair.right}</span>
                  {revealed && isMatched && isMatchCorrect && (
                    <Check className="size-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                  )}
                  {revealed && isMatched && !isMatchCorrect && (
                    <X className="size-4 shrink-0" strokeWidth={3} aria-hidden="true" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          size="sm"
          className="bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800"
          disabled={!revealed && !allAnswered}
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
