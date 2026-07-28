"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AnswerStatus,
  ComparisonAnswer,
  QuizzesDictionary,
  ThisVsThatQuestion,
} from "@/features/quiz/types";

interface ThisVsThatQuestionProps {
  question: ThisVsThatQuestion;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

const OPTIONS: ComparisonAnswer[] = ["a", "b", "both", "neither"];

export function ThisVsThatQuestionRenderer({
  question,
  dictionary,
  onStatusChange,
}: ThisVsThatQuestionProps) {
  const [answers, setAnswers] = useState<
    Partial<Record<string, ComparisonAnswer>>
  >({});
  const [revealed, setRevealed] = useState(false);

  const allAnswered = question.statements.every(
    (statement) => answers[statement.id] !== undefined
  );
  const correct = question.statements.every(
    (statement) =>
      answers[statement.id] === question.correctAnswers[statement.id]
  );

  const optionLabel = (option: ComparisonAnswer) => {
    switch (option) {
      case "a":
        return question.subjectA;
      case "b":
        return question.subjectB;
      case "both":
        return dictionary.both;
      case "neither":
        return dictionary.neither;
    }
  };

  const toggleRevealed = () => {
    const next = !revealed;
    setRevealed(next);
    onStatusChange?.(next ? (correct ? "correct" : "incorrect") : "idle");
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-ink-faint italic">{dictionary.thisVsThatHint}</p>
      <ul className="flex list-none flex-col divide-y divide-rule !p-0">
        {question.statements.map((statement) => {
          const selected = answers[statement.id];
          const correctOption = question.correctAnswers[statement.id];

          return (
            <li
              key={statement.id}
              className="!m-0 flex flex-col gap-2 py-4 first:pt-0 last:pb-0 before:!content-none"
            >
              <p className="text-sm text-ink-body">{statement.label}</p>
              <div className="flex flex-wrap gap-2">
                {OPTIONS.map((option) => {
                  const isSelected = selected === option;
                  const isCorrectOption = correctOption === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={revealed}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [statement.id]: option,
                        }))
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border border-rule bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-body transition-colors outline-none",
                        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        revealed
                          ? "cursor-default"
                          : "cursor-pointer hover:border-rule-strong hover:text-ink-heading",
                        !revealed &&
                          isSelected &&
                          "border-primary-700 bg-primary-700/10 text-ink-heading",
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
                      {revealed && isSelected && isCorrectOption && (
                        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                      )}
                      {revealed && isSelected && !isCorrectOption && (
                        <X className="size-3" strokeWidth={3} aria-hidden="true" />
                      )}
                      {optionLabel(option)}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
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
