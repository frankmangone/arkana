import { useMutation, useQuery } from "@tanstack/react-query";
import type { QuestionResponse } from "@/features/quiz/types";
import {
  AnswerApiResponse,
  CompleteAttemptResponse,
  completeAttempt,
  getQuizAvailability,
  getNextQuestion,
  NextQuestionResponse,
  QuizAvailabilityResponse,
  skipQuestion,
  submitAnswer,
} from "../services/quiz";

interface UseQuizAvailabilityParams {
  listSlug: string;
  moduleSlug: string;
}

/**
 * Hook to check whether a module has a quiz available. Public data - not
 * gated on auth, unlike useReadStatuses.
 */
export function useQuizAvailability({ listSlug, moduleSlug }: UseQuizAvailabilityParams) {
  return useQuery<QuizAvailabilityResponse, Error>({
    queryKey: ["quizAvailability", listSlug, moduleSlug],
    queryFn: () => getQuizAvailability(listSlug, moduleSlug),
    enabled: !!listSlug && !!moduleSlug,
  });
}

// ============ Quiz attempts ============
// NOTE: starting an attempt deliberately has no useMutation wrapper - the
// attempt view fires it once on mount, where a mutation's result never
// survives StrictMode's double effect pass. It calls the startAttempt
// service directly instead (see quiz-attempt-view.tsx).

interface UseNextQuestionParams {
  attemptId: string | undefined;
  lang: string;
  enabled?: boolean;
}

/** Hook to fetch the question at the attempt's current position. */
export function useNextQuestion({ attemptId, lang, enabled = true }: UseNextQuestionParams) {
  return useQuery<NextQuestionResponse, Error>({
    queryKey: ["quizNextQuestion", attemptId, lang],
    queryFn: () => getNextQuestion(attemptId as string, lang),
    enabled: enabled && !!attemptId,
  });
}

export interface UseSubmitAnswerParams {
  attemptId: string;
  questionId: string;
  response: QuestionResponse;
  lang: string;
}

/** Hook to submit a response for the current question. */
export function useSubmitAnswer() {
  return useMutation<AnswerApiResponse, Error, UseSubmitAnswerParams>({
    mutationFn: ({ attemptId, questionId, response, lang }) =>
      submitAnswer(attemptId, questionId, response, lang),
  });
}

export interface UseSkipQuestionParams {
  attemptId: string;
  questionId: string;
  lang: string;
}

/** Hook to skip the current question, advancing the attempt. */
export function useSkipQuestion() {
  return useMutation<AnswerApiResponse, Error, UseSkipQuestionParams>({
    mutationFn: ({ attemptId, questionId, lang }) =>
      skipQuestion(attemptId, questionId, lang),
  });
}

/** Hook to finalize an attempt once every question is answered. */
export function useCompleteAttempt() {
  return useMutation<CompleteAttemptResponse, Error, string>({
    mutationFn: (attemptId) => completeAttempt(attemptId),
  });
}
