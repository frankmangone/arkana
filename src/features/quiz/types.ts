import type { Dictionary } from "@/lib/dictionaries";

export type QuestionDifficulty = 1 | 2 | 3;

/** The `quizzes` dictionary section - all static UI text, per locale. */
export type QuizzesDictionary = Dictionary["quizzes"];

/** Grading state of a single question, driven by the card once a check resolves. */
export type AnswerStatus = "idle" | "correct" | "incorrect";

interface QuestionBase {
  id: string;
  prompt: string;
  difficulty: QuestionDifficulty;
}

// ===== Delivered content - never carries the correct answer. Matches the
// backend's `content` wire shape exactly (see grading.go / question_service.go),
// so the same shape works whether it came from a real attempt or a sandbox fixture. =====

export interface ChoiceOption {
  id: string;
  label: string;
}

interface ChoiceQuestionBase extends QuestionBase {
  options: ChoiceOption[];
}

// Split into two literal types rather than one "choice" + an allowMultiple
// flag - the picker's own type is what has to signal "pick one" vs "pick
// any number", not a sentence in the prompt copy.
export interface SingleChoiceQuestion extends ChoiceQuestionBase {
  type: "single_choice";
}

export interface MultiChoiceQuestion extends ChoiceQuestionBase {
  type: "multi_choice";
}

export interface MatchingItem {
  id: string;
  label: string;
}

export interface MatchingQuestion extends QuestionBase {
  type: "matching";
  /** Independent id spaces - left/right ids never correlate structurally. */
  left: MatchingItem[];
  right: MatchingItem[];
}

export interface RangeItem {
  id: string;
  /** What this particular slider is estimating, e.g. "RSA-2048 key size". */
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface RangeQuestion extends QuestionBase {
  type: "range";
  /** One or more independent estimates graded together as a single question. */
  ranges: RangeItem[];
}

export interface SequencingStep {
  id: string;
  label: string;
}

export interface SequencingQuestion extends QuestionBase {
  type: "sequencing";
  /** Delivered in authored order, which may be the solved order - the
   * backend stores/serves content verbatim with no reordering, so the
   * renderer shuffles this client-side before display. */
  steps: SequencingStep[];
}

export interface BucketDefinition {
  id: string;
  label: string;
}

export interface BucketItem {
  id: string;
  label: string;
}

export interface BucketSortQuestion extends QuestionBase {
  type: "bucket_sort";
  /** Exactly two - the sort is always a binary split. */
  buckets: [BucketDefinition, BucketDefinition];
  items: BucketItem[];
}

export interface FillBlankQuestion extends QuestionBase {
  type: "fill_blank";
  /** Prompt text with `{{blankId}}` placeholders - blank ids are parsed
   * from this template, not listed separately. */
  template: string;
  /** Word bank shown beneath the sentence - every blank's correct word plus a
   * few distractors, in authored order. The backend stores/serves this
   * verbatim with no reordering, so the renderer shuffles it client-side
   * before display. */
  wordBank: string[];
}

export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | MatchingQuestion
  | RangeQuestion
  | SequencingQuestion
  | BucketSortQuestion
  | FillBlankQuestion;

// ===== Answer keys - "what was actually right." Matches the backend's
// answer_key / correctReveal wire shape exactly. Never present on a Question
// itself; only ever produced by a CheckAnswer call, and even then only when
// the submission was incorrect (an exact mirror of the real API's behavior:
// see AnswerResponse.correctReveal in the Go handler). =====

export interface ChoiceAnswerKey {
  correctOptionIds: string[];
}

export interface AssignmentsAnswerKey {
  correctAssignments: Record<string, string>;
}

export interface RangeAnswerKey {
  correctValues: Record<string, { value: number; tolerance: number }>;
}

export interface SequencingAnswerKey {
  correctOrder: string[];
}

export interface FillBlankAnswerKey {
  correctWords: Record<string, string>;
}

export type AnswerKey =
  | ChoiceAnswerKey
  | AssignmentsAnswerKey
  | RangeAnswerKey
  | SequencingAnswerKey
  | FillBlankAnswerKey;

// ===== Responses - what a renderer collects and reports upward, and what
// gets submitted to the real backend verbatim. =====

export interface ChoiceResponse {
  selectedOptionIds: string[];
}

export interface AssignmentsResponse {
  assignments: Record<string, string>;
}

export interface RangeResponse {
  values: Record<string, number>;
}

export interface SequencingResponse {
  order: string[];
}

export interface FillBlankResponse {
  filled: Record<string, string>;
}

export type QuestionResponse =
  | ChoiceResponse
  | AssignmentsResponse
  | RangeResponse
  | SequencingResponse
  | FillBlankResponse;

/**
 * Result of checking an answer - identical shape whether graded locally
 * (sandbox, against an embedded answer key) or by the real backend
 * (POST .../answers). `correctReveal`/`explanation` are only meaningful
 * (and only ever populated) when `correct` is false.
 */
export interface AnswerCheckResult {
  correct: boolean;
  correctReveal?: AnswerKey;
  explanation?: string;
}

/**
 * What a QuestionCard calls to grade a response. The sandbox implements
 * this synchronously (wrapped in a resolved Promise) against a fixture's
 * embedded answer key; a real attempt implements it as a POST to the quiz
 * session API. Neither the card nor any renderer needs to know which.
 */
export type CheckAnswer = (response: QuestionResponse) => Promise<AnswerCheckResult>;
