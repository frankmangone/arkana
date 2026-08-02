"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { LatexText } from "@/components/ui/latex-text";
import { useQuestionAnswer } from "@/features/quiz/lib/answer-context";
import { shuffled } from "@/features/quiz/lib/shuffle";
import { cn } from "@/lib/utils";
import type { FillBlankAnswerKey, FillBlankQuestion, QuizzesDictionary } from "@/features/quiz/types";

interface FillBlankQuestionProps {
  question: FillBlankQuestion;
  dictionary: QuizzesDictionary;
}

const SPRING = { type: "spring" as const, stiffness: 700, damping: 40 };
const BLANK_TOKEN = /\{\{(\w+)\}\}/g;

const styles = {
  wrapper: "flex flex-col gap-4",
  hint: "text-xs text-ink-faint italic",
  // leading-loose (vs. the pills' own leading-snug below) keeps wrapped
  // lines far enough apart that pills on consecutive lines don't touch.
  template: "text-[15px] leading-loose text-ink-body pt-4",
  blank: (word: string | undefined, revealed: boolean, isCorrect: boolean, isDragOver: boolean) => cn(
    "mx-1 inline-flex min-w-[4.5rem] items-center justify-center gap-1 rounded border px-2 py-0.5 align-baseline text-[15px] leading-snug font-medium outline-none transition-colors",
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
    "rounded-md border border-rule bg-surface-raised px-3 py-1.5 text-[15px] leading-snug text-ink-body transition-colors outline-none",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    isUsed
      ? "cursor-default opacity-30"
      : "cursor-grab hover:border-rule-strong hover:text-ink-heading active:cursor-grabbing"
  ),
};

type TemplatePart = { kind: "text"; value: string } | { kind: "blank"; id: string };

interface DragSource {
  wordIndex: number;
  /** Where the drag started from - another blank, or null for the word bank. */
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

/** Blank ids are parsed straight out of the template - there's no separate list. */
function blankIds(template: string): string[] {
  return parseTemplate(template)
    .filter((part): part is { kind: "blank"; id: string } => part.kind === "blank")
    .map((part) => part.id);
}

export function FillBlankQuestionRenderer({
  question,
  dictionary,
}: FillBlankQuestionProps) {
  const { revealed, correct, correctReveal, reportResponse } = useQuestionAnswer();
  // Shuffled once per mount so the word bank doesn't start in the authored
  // order (e.g. correct answers always first) - grading compares words, not
  // positions, so shuffling here is purely presentational.
  const [wordBank] = useState(() => shuffled(question.wordBank));
  // blankId -> index into wordBank
  const [filled, setFilled] = useState<Record<string, number>>({});
  const [draggedFrom, setDraggedFrom] = useState<DragSource | null>(null);
  const [dragOverBlankId, setDragOverBlankId] = useState<string | null>(null);

  const parts = parseTemplate(question.template);
  const ids = blankIds(question.template);
  const usedIndices = new Set(Object.values(filled));

  // On a correct submission the backend never sends the answer key back -
  // the user's own filled words already equal it.
  const correctWords = correct
    ? undefined
    : (correctReveal as FillBlankAnswerKey | undefined)?.correctWords;

  const applyFilled = (next: Record<string, number>) => {
    setFilled(next);
    reportResponse({
      response: {
        filled: Object.fromEntries(
          Object.entries(next).map(([blankId, wordIndex]) => [blankId, wordBank[wordIndex]])
        ),
      },
      canSubmit: ids.every((id) => next[id] !== undefined),
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

  // Word bank chips fill whichever blank comes first in reading order -
  // no separate "select a blank" step needed since that order is unambiguous.
  const fillNextBlank = (wordIndex: number) => {
    if (revealed || usedIndices.has(wordIndex)) return;
    const nextBlank = ids.find((id) => filled[id] === undefined);
    if (!nextBlank) return;
    placeWord(nextBlank, wordIndex, null);
  };

  const clearBlank = (blankId: string) => {
    if (revealed || filled[blankId] === undefined) return;
    const next = { ...filled };
    delete next[blankId];
    applyFilled(next);
  };

  // Dragging targets a specific blank directly, so - unlike tap, which
  // always fills the next empty one in reading order - it fills blanks out
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

          const wordIndex = filled[part.id];
          const word = wordIndex !== undefined ? wordBank[wordIndex] : undefined;
          const isCorrect = correct === true || (word !== undefined && correctWords?.[part.id] === word);
          const isDragOver = dragOverBlankId === part.id;

          return (
            <button
              key={i}
              type="button"
              disabled={revealed || word === undefined}
              draggable={!revealed && word !== undefined}
              onDragStart={(event) => {
                event.stopPropagation();
                if (wordIndex !== undefined) {
                  setDraggedFrom({ wordIndex, sourceBlankId: part.id });
                }
              }}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => handleDragOverBlank(event, part.id)}
              onDragLeave={() => handleDragLeaveBlank(part.id)}
              onDrop={(event) => handleDropOnBlank(event, part.id)}
              onClick={() => clearBlank(part.id)}
              className={styles.blank(word, revealed, isCorrect, isDragOver)}
            >
              {word !== undefined ? <LatexText inline>{word}</LatexText> : "-----"}
              {word !== undefined && (
                <span
                  className="flex size-3.5 shrink-0 items-center justify-center"
                  aria-hidden="true"
                >
                  {revealed ? (
                    isCorrect ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      <X className="size-3.5" strokeWidth={3} />
                    )
                  ) : (
                    // Subtle click-to-clear indicator; occupies the same slot
                    // the grading icon will take, so reveal doesn't reflow.
                    <X className="size-3 text-ink-muted" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </p>

      <ul className={styles.wordBankList}>
        {wordBank.map((word, index) => {
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
