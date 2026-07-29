"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { LatexText } from "@/components/ui/latex-text";
import {
  EMPTY_ANSWER_REPORT,
  useQuestionAnswer,
} from "@/features/quiz/lib/answer-context";
import { shuffled } from "@/features/quiz/lib/shuffle";
import { cn } from "@/lib/utils";
import type {
  MatchingPair,
  MatchingQuestion,
  QuizzesDictionary,
} from "@/features/quiz/types";

interface MatchingQuestionProps {
  question: MatchingQuestion;
  dictionary: QuizzesDictionary;
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
  return `${String.fromCharCode(65 + index)}.`;
}

const SPRING = { type: "spring" as const, stiffness: 700, damping: 40 };

const styles = {
  wrapper: "flex flex-col gap-4",
  hint: "text-xs text-ink-faint italic",
  grid: "relative grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-8",
  svg: "pointer-events-none absolute inset-0 hidden h-full w-full md:block",
  line: (correct: boolean | null) => cn(
    "transition-colors",
    correct === null && "text-primary-700/50",
    correct === true && "text-teal",
    correct === false && "text-magenta"
  ),
  column: "flex list-none flex-col gap-2 !p-0",
  columnItem: "!m-0 before:!content-none",
  item: (revealed: boolean, isActive: boolean, isMatched: boolean, isMatchCorrect: boolean) => cn(
    "relative flex min-h-16 w-full items-center gap-2.5 rounded-md border border-rule bg-surface-raised px-3 py-2.5 text-left text-sm text-ink-body transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    revealed
      ? "cursor-default"
      : isActive || isMatched
        ? "cursor-pointer"
        : "cursor-pointer hover:border-rule-strong hover:text-ink-heading",
    !revealed &&
      isActive &&
      "border-primary-700 bg-primary-700/10 text-ink-heading",
    !revealed &&
      !isActive &&
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
  ),
  // Absolutely positioned so it doesn't eat into the row's own flex layout
  // or shift the label when it appears.
  itemLetter: "eyebrow absolute top-1.5 left-2 text-xs",
  itemLabel: "flex-1 pl-4",
  // Reserved even before reveal — rendering this icon only once revealed
  // shrinks the label's flex-1 space and shifts the layout right when the
  // check/X pops in.
  itemIconSlot: "flex size-4 shrink-0 items-center justify-center",
};

export function MatchingQuestionRenderer({
  question,
  dictionary,
}: MatchingQuestionProps) {
  const { revealed, reportAnswer } = useQuestionAnswer();
  const [rightOrder] = useState(() => shuffled(question.pairs));
  // leftPairId -> rightPairId it's currently matched with
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  // leftPairIds in the order they were matched — matched pairs hoist to the
  // top of both columns in this order, landing on the same row, so the
  // connecting line stays short instead of cutting diagonally across rows.
  const [matchOrder, setMatchOrder] = useState<string[]>([]);
  const [active, setActive] = useState<{ id: string; side: "left" | "right" } | null>(
    null
  );
  const [lines, setLines] = useState<LineSegment[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const leftPairById = new Map(question.pairs.map((pair) => [pair.id, pair]));
  const rightPairById = new Map(rightOrder.map((pair) => [pair.id, pair]));

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

  // Either column can start a selection. Clicking the same column just
  // changes (or clears) the active pick; clicking the other column commits
  // a match against whatever's currently active, then resets to neutral.
  const selectItem = (side: "left" | "right", id: string) => {
    if (revealed) return;

    if (!active) {
      setActive({ id, side });
      return;
    }

    if (active.side === side) {
      setActive(active.id === id ? null : { id, side });
      return;
    }

    const leftId = side === "left" ? id : active.id;
    const rightId = side === "left" ? active.id : id;
    const prevOwner = Object.keys(assignments).find(
      (ownerId) => assignments[ownerId] === rightId
    );

    const nextAssignments = { ...assignments };
    if (prevOwner) delete nextAssignments[prevOwner];
    nextAssignments[leftId] = rightId;

    setAssignments(nextAssignments);
    setMatchOrder((prev) => [
      ...prev.filter((existingId) => existingId !== leftId && existingId !== prevOwner),
      leftId,
    ]);
    setActive(null);
    reportAnswer({
      canSubmit: question.pairs.every((pair) => nextAssignments[pair.id]),
      correct: question.pairs.every(
        (pair) => nextAssignments[pair.id] === pair.id
      ),
      onRetry: () => {
        setAssignments({});
        setMatchOrder([]);
        setActive(null);
        reportAnswer(EMPTY_ANSWER_REPORT);
      },
    });
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
    <div className={styles.wrapper}>
      <p className={styles.hint}>{dictionary.matchingHint}</p>
      <div ref={containerRef} className={styles.grid}>
        <svg aria-hidden="true" className={styles.svg}>
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
              className={styles.line(line.correct)}
            />
          ))}
        </svg>
        <ul className={styles.column}>
          {leftRenderOrder.map((pair) => {
            const isActive = active?.side === "left" && active.id === pair.id;
            const assignedRightId = assignments[pair.id];
            const isMatchCorrect = assignedRightId === pair.id;

            return (
              <motion.li
                key={pair.id}
                layout
                transition={SPRING}
                className={styles.columnItem}
              >
                <button
                  ref={(el) => {
                    leftRefs.current[pair.id] = el;
                  }}
                  type="button"
                  aria-pressed={isActive}
                  disabled={revealed}
                  onClick={() => selectItem("left", pair.id)}
                  className={styles.item(
                    revealed,
                    isActive,
                    Boolean(assignedRightId),
                    isMatchCorrect
                  )}
                >
                  <span className={styles.itemLetter}>
                    {assignedRightId && letterFor(matchOrder.indexOf(pair.id))}
                  </span>
                  <span className={styles.itemLabel}>
                    <LatexText inline>{pair.left}</LatexText>
                  </span>
                  <span className={styles.itemIconSlot}>
                    {revealed &&
                      (isMatchCorrect ? (
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
        <ul className={styles.column}>
          {rightRenderOrder.map((rightPair) => {
            const isActive =
              active?.side === "right" && active.id === rightPair.id;
            const matchedLeftId = Object.keys(assignments).find(
              (leftId) => assignments[leftId] === rightPair.id
            );
            const isMatched = matchedLeftId !== undefined;
            const isMatchCorrect = matchedLeftId === rightPair.id;

            return (
              <motion.li
                key={rightPair.id}
                layout
                transition={SPRING}
                className={styles.columnItem}
              >
                <button
                  ref={(el) => {
                    rightRefs.current[rightPair.id] = el;
                  }}
                  type="button"
                  aria-pressed={isActive}
                  disabled={revealed}
                  onClick={() => selectItem("right", rightPair.id)}
                  className={styles.item(revealed, isActive, isMatched, isMatchCorrect)}
                >
                  <span className={styles.itemLetter}>
                    {isMatched && letterFor(matchOrder.indexOf(matchedLeftId))}
                  </span>
                  <span className={styles.itemLabel}>
                    <LatexText inline>{rightPair.right}</LatexText>
                  </span>
                  <span className={styles.itemIconSlot}>
                    {revealed &&
                      isMatched &&
                      (isMatchCorrect ? (
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
    </div>
  );
}
