"use client";

import { createContext, useContext } from "react";

export interface AnswerReport {
  /** Whether the card's check-answer button should be enabled. */
  canSubmit: boolean;
  correct: boolean;
  /**
   * Extra cleanup when the user un-reveals to retry (e.g. clear placements).
   * A renderer that clears state here must also push a fresh report so the
   * card's grading doesn't go stale against the cleared state.
   */
  onRetry?: () => void;
}

/** What a renderer reports before the user has interacted at all. */
export const EMPTY_ANSWER_REPORT: AnswerReport = {
  canSubmit: false,
  correct: false,
};

interface QuestionAnswerContextValue {
  revealed: boolean;
  reportAnswer: (report: AnswerReport) => void;
}

const QuestionAnswerContext = createContext<QuestionAnswerContextValue | null>(
  null
);

export const QuestionAnswerProvider = QuestionAnswerContext.Provider;

export function useQuestionAnswer() {
  const value = useContext(QuestionAnswerContext);
  if (!value) {
    throw new Error("useQuestionAnswer must be used inside a QuestionCard");
  }
  return value;
}
