"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { LatexText } from "@/components/ui/latex-text";
import {
  EMPTY_ANSWER_REPORT,
  useQuestionAnswer,
} from "@/features/quiz/lib/answer-context";
import { cn } from "@/lib/utils";
import type { FillBlankQuestion, QuizzesDictionary } from "@/features/quiz/types";

interface FillBlankQuestionProps {
  question: FillBlankQuestion;
  dictionary: QuizzesDictionary;
}

const SPRING = { type: "spring" as const, stiffness: 700, damping: 40 };
const BLANK_TOKEN = /\{\{(\w+)\}\}/g;

const styles = {
  wrapper: "flex flex-col gap-4",
  hint: "text-xs text-ink-faint italic",
  template: "text-sm leading-relaxed text-ink-body pt-4",
  blank: (word: string | undefined, revealed: boolean, isCorrect: boolean, isDragOver: boolean) => cn(
    "mx-1 inline-flex min-w-[4.5rem] items-center justify-center gap-1 rounded border px-2 py-0.5 align-baseline text-sm font-medium outline-none transition-colors",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    word === undefined && "border-dashed border-rule-strong text-ink-faint",
    word !== undefined &&
      !revealed &&
      "cursor-grab border-primary-700 bg-primary-700/10 text-ink-heading hover:border-primary-800 active:cursor-grabbing",
    revealed && isCorrect && "border-teal bg-teal/10 text-ink-heading",
    revealed &&
      word !== undefined &&
      !isCorrect &&
      "border-magenta bg-magenta/10",
    isDragOver && "border-primary-700 bg-primary-700/10"
  ),
  wordBankList: "flex list-none flex-wrap gap-2 !p-0",
  wordBankItem: "!m-0 before:!content-none",
  wordBankChip: (revealed: boolean, isUsed: boolean) => cn(
    "rounded-md border border-rule bg-surface-raised px-3 py-1.5 text-sm text-ink-body transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    isUsed
      ? "cursor-default opacity-30"
      : "cursor-grab hover:border-rule-strong hover:text-ink-heading active:cursor-grabbing"
  ),
};

type TemplatePart = { kind: "text"; value: string } | { kind: "blank"; id: string };

interface DragSource {
  wordIndex: number;
  /** Where the drag started from — another blank, or null for the word bank. */
  sourceBlankId: string | null;
}

function parseTemplate(template: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  BLANK_TOKEN.lastIndex = 0;
  while ((match = BLANK_TOKEN.exec(template))) {
    if (match.index > lastIndex) {
      parts.push({ kind: "text", value: template.slice(lastIndex, match.index) });
    }
    parts.push({ kind: "blank", id: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < template.length) {
    parts.push({ kind: "text", value: template.slice(lastIndex) });
  }
  return parts;
}

export function FillBlankQuestionRenderer({
  question,
  dictionary,
}: FillBlankQuestionProps) {
  const { revealed, reportAnswer } = useQuestionAnswer();
  // blankId -> index into question.wordBank
  const [filled, setFilled] = useState<Record<string, number>>({});
  const [draggedFrom, setDraggedFrom] = useState<DragSource | null>(null);
  const [dragOverBlankId, setDragOverBlankId] = useState<string | null>(null);

  const parts = parseTemplate(question.template);
  const usedIndices = new Set(Object.values(filled));

  const applyFilled = (next: Record<string, number>) => {
    setFilled(next);
    reportAnswer({
      canSubmit: question.blanks.every((blank) => next[blank.id] !== undefined),
      correct: question.blanks.every((blank) => {
        const wordIndex = next[blank.id];
        return (
          wordIndex !== undefined &&
          question.wordBank[wordIndex] === blank.correctWord
        );
      }),
      onRetry: () => {
        setFilled({});
        reportAnswer(EMPTY_ANSWER_REPORT);
      },
    });
  };

  const placeWord = (
    blankId: string,
    wordIndex: number,
    sourceBlankId: string | null
  ) => {
    if (revealed) return;
    const next = { ...filled, [blankId]: wordIndex };
    if (sourceBlankId && sourceBlankId !== blankId) delete next[sourceBlankId];
    applyFilled(next);
  };

  // Word bank chips fill whichever blank comes first in reading order —
  // no separate "select a blank" step needed since that order is unambiguous.
  const fillNextBlank = (wordIndex: number) => {
    if (revealed || usedIndices.has(wordIndex)) return;
    const nextBlank = question.blanks.find((blank) => filled[blank.id] === undefined);
    if (!nextBlank) return;
    placeWord(nextBlank.id, wordIndex, null);
  };

  const clearBlank = (blankId: string) => {
    if (revealed || filled[blankId] === undefined) return;
    const next = { ...filled };
    delete next[blankId];
    applyFilled(next);
  };

  // Dragging targets a specific blank directly, so — unlike tap, which
  // always fills the next empty one in reading order — it fills blanks out
  // of order. Dragging out of an already-filled blank moves its word rather
  // than duplicating it.
  const handleDragOverBlank = (event: React.DragEvent, blankId: string) => {
    if (revealed || !draggedFrom) return;
    event.preventDefault();
    setDragOverBlankId(blankId);
  };

  const handleDragLeaveBlank = (blankId: string) => {
    setDragOverBlankId((prev) => (prev === blankId ? null : prev));
  };

  const handleDropOnBlank = (event: React.DragEvent, blankId: string) => {
    event.preventDefault();
    if (revealed || !draggedFrom) return;
    placeWord(blankId, draggedFrom.wordIndex, draggedFrom.sourceBlankId);
    setDraggedFrom(null);
    setDragOverBlankId(null);
  };

  const handleDragEnd = () => {
    setDraggedFrom(null);
    setDragOverBlankId(null);
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>{dictionary.fillBlankHint}</p>

      <p className={styles.template}>
        {parts.map((part, i) => {
          if (part.kind === "text")
            return (
              <LatexText key={i} unwrap>
                {part.value}
              </LatexText>
            );

          const blank = question.blanks.find((b) => b.id === part.id);
          if (!blank) return null;
          const wordIndex = filled[blank.id];
          const word = wordIndex !== undefined ? question.wordBank[wordIndex] : undefined;
          const isCorrect = word === blank.correctWord;
          const isDragOver = dragOverBlankId === blank.id;

          return (
            <button
              key={i}
              type="button"
              disabled={revealed || word === undefined}
              draggable={!revealed && word !== undefined}
              onDragStart={(event) => {
                event.stopPropagation();
                if (wordIndex !== undefined) {
                  setDraggedFrom({ wordIndex, sourceBlankId: blank.id });
                }
              }}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => handleDragOverBlank(event, blank.id)}
              onDragLeave={() => handleDragLeaveBlank(blank.id)}
              onDrop={(event) => handleDropOnBlank(event, blank.id)}
              onClick={() => clearBlank(blank.id)}
              className={styles.blank(word, revealed, isCorrect, isDragOver)}
            >
              {word !== undefined ? <LatexText inline>{word}</LatexText> : "-----"}
              {revealed &&
                word !== undefined &&
                (isCorrect ? (
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <X className="size-3.5" strokeWidth={3} aria-hidden="true" />
                ))}
            </button>
          );
        })}
      </p>

      <ul className={styles.wordBankList}>
        {question.wordBank.map((word, index) => {
          const isUsed = usedIndices.has(index);

          return (
            <motion.li
              key={index}
              layout
              transition={SPRING}
              className={styles.wordBankItem}
            >
              <button
                type="button"
                disabled={revealed || isUsed}
                draggable={!revealed && !isUsed}
                onDragStart={(event) => {
                  event.stopPropagation();
                  setDraggedFrom({ wordIndex: index, sourceBlankId: null });
                }}
                onDragEnd={handleDragEnd}
                onClick={() => fillNextBlank(index)}
                className={styles.wordBankChip(revealed, isUsed)}
              >
                <LatexText inline>{word}</LatexText>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
