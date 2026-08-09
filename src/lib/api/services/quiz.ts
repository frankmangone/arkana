import apiClient from "../client";
import type { AnswerKey, Question, QuestionResponse } from "@/features/quiz/types";

export interface QuizAvailabilityResponse {
  available: boolean;
  languages: string[];
}

/**
 * Check whether a module currently has a quiz, and which languages have
 * full translation coverage over it. Public endpoint, no auth required.
 *
 * @param listSlug - The reading list's slug
 * @param moduleSlug - The module's slug within that reading list
 */
export async function getQuizAvailability(
  listSlug: string,
  moduleSlug: string
): Promise<QuizAvailabilityResponse> {
  const response = await apiClient.get<QuizAvailabilityResponse>(
    `/api/reading-lists/${listSlug}/modules/${moduleSlug}/quiz/availability`
  );
  return response.data;
}

// ============ Quiz attempts ============

export interface StartAttemptResponse {
  attemptId: string;
  totalQuestions: number;
}

/** Wire shape of a delivered question - see QuestionDTO in the Go handlers. */
export interface QuestionDTO {
  uuid: string;
  type: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  content: Record<string, unknown>;
}

export interface NextQuestionResponse {
  question: QuestionDTO | null;
  position: number;
  totalQuestions: number;
  done: boolean;
}

export interface ReinforcementDTO {
  postPaths: string[];
}

export interface AnswerApiResponse {
  correct: boolean;
  skipped: boolean;
  correctReveal?: AnswerKey;
  explanation?: string;
  reinforcement?: ReinforcementDTO;
  attemptDone: boolean;
}

export interface CompleteAttemptResponse {
  score: number;
  passed: boolean;
  /** Reinforcement posts aggregated over every missed (wrong or skipped)
   * answer, in the order they were missed. Empty on a perfect run. */
  reviewPostPaths: string[];
}

/** Flattens a QuestionDTO's separate `type`/`prompt`/`difficulty`/`content`
 * fields into the single flat shape the renderers expect. */
export function toQuestion(dto: QuestionDTO): Question {
  return {
    id: dto.uuid,
    type: dto.type,
    difficulty: dto.difficulty,
    prompt: dto.prompt,
    ...dto.content,
  } as Question;
}

/**
 * Start a new quiz attempt for a module. Auth required (Bearer token
 * auto-attached by the axios interceptor).
 */
export async function startAttempt(
  listSlug: string,
  moduleSlug: string
): Promise<StartAttemptResponse> {
  const response = await apiClient.post<StartAttemptResponse>(
    `/api/reading-lists/${listSlug}/modules/${moduleSlug}/quiz/attempts`
  );
  return response.data;
}

/** Fetch the question at the attempt's current position (idempotent until answered). */
export async function getNextQuestion(
  attemptId: string,
  lang: string
): Promise<NextQuestionResponse> {
  const response = await apiClient.get<NextQuestionResponse>(
    `/api/quiz-attempts/${attemptId}/next?lang=${lang}`
  );
  return response.data;
}

/** Submit a response for the question at the attempt's current position. */
export async function submitAnswer(
  attemptId: string,
  questionId: string,
  response: QuestionResponse,
  lang: string
): Promise<AnswerApiResponse> {
  const result = await apiClient.post<AnswerApiResponse>(
    `/api/quiz-attempts/${attemptId}/answers?lang=${lang}`,
    { questionId, response }
  );
  return result.data;
}

/** Record a skip for the question at the attempt's current position - like an
 * incorrect answer, this advances the attempt (the server never advances
 * without an answer or a skip). */
export async function skipQuestion(
  attemptId: string,
  questionId: string,
  lang: string
): Promise<AnswerApiResponse> {
  const result = await apiClient.post<AnswerApiResponse>(
    `/api/quiz-attempts/${attemptId}/answers?lang=${lang}`,
    { questionId, skipped: true }
  );
  return result.data;
}

/** Finalize an attempt once every question has been answered, computing the score. */
export async function completeAttempt(attemptId: string): Promise<CompleteAttemptResponse> {
  const response = await apiClient.post<CompleteAttemptResponse>(
    `/api/quiz-attempts/${attemptId}/complete`
  );
  return response.data;
}

// ============ Question flags ============

export interface QuestionFlagResponse {
  id: number;
  question_id: number;
  user_id: number;
  reason: string;
  created_at: string;
}

/** Report an issue with a question. Resubmitting overwrites the caller's
 * own prior flag on the same question rather than creating a duplicate. */
export async function flagQuestion(
  questionUuid: string,
  reason: string
): Promise<QuestionFlagResponse> {
  const response = await apiClient.post<QuestionFlagResponse>(
    `/api/questions/${questionUuid}/flags`,
    { reason }
  );
  return response.data;
}
