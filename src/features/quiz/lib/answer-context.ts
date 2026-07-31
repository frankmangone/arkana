"use client";

import { createContext, useContext } from "react";
import type { AnswerKey, QuestionResponse } from "@/features/quiz/types";

export interface ResponseReport {
  response: QuestionResponse;
  /** Whether the card's check-answer button should be enabled. */
  canSubmit: boolean;
}

/** What a renderer reports before the user has interacted at all. */
export const EMPTY_RESPONSE_REPORT: ResponseReport = {
  response: {} as QuestionResponse,
  canSubmit: false,
};

interface QuestionAnswerContextValue {
  revealed: boolean;
  /**
   * Set once revealed. When true, renderers should treat the user's own
   * last-reported response as ground truth for "correct" styling - the real
   * backend never sends the answer key back on a correct submission, so
   * there's nothing else to read it from, and nothing else is needed: an
   * exact-match grading rule means "correct" already implies the user's
   * picks equal the answer key.
   */
  correct?: boolean;
  /** Only ever set when revealed && !correct - "what was actually right." */
  correctReveal?: AnswerKey;
  reportResponse: (report: ResponseReport) => void;
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
