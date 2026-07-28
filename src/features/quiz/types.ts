import type { Dictionary } from "@/lib/dictionaries";

export type QuestionDifficulty = 1 | 2 | 3;

/** The `quizzes` dictionary section — all static UI text, per locale. */
export type QuizzesDictionary = Dictionary["quizzes"];

/** Grading state of a single question, driven by its renderer. */
export type AnswerStatus = "idle" | "correct" | "incorrect";

interface QuestionBase {
  id: string;
  prompt: string;
  difficulty: QuestionDifficulty;
  /** Shown on incorrect reveal — explains why the marked answer is correct. */
  explanation?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
}

interface ChoiceQuestionBase extends QuestionBase {
  options: ChoiceOption[];
  correctOptionIds: string[];
}

// Split into two literal types rather than one "choice" + an allowMultiple
// flag — the picker's own type is what has to signal "pick one" vs "pick
// any number", not a sentence in the prompt copy.
export interface SingleChoiceQuestion extends ChoiceQuestionBase {
  type: "single_choice";
}

export interface MultiChoiceQuestion extends ChoiceQuestionBase {
  type: "multi_choice";
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends QuestionBase {
  type: "matching";
  pairs: MatchingPair[];
}

export interface RangeItem {
  id: string;
  /** What this particular slider is estimating, e.g. "RSA-2048 key size". */
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  correctValue: number;
  tolerance: number;
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
  /** Steps in correct order; components are responsible for shuffling at render time. */
  steps: SequencingStep[];
}

export type ComparisonAnswer = "a" | "b" | "both" | "neither";

export interface ComparisonStatement {
  id: string;
  label: string;
}

export interface ThisVsThatQuestion extends QuestionBase {
  type: "this_vs_that";
  subjectA: string;
  subjectB: string;
  statements: ComparisonStatement[];
  correctAnswers: Record<string, ComparisonAnswer>;
}

export interface BucketDefinition {
  id: string;
  label: string;
}

export interface BucketItem {
  id: string;
  label: string;
  correctBucketId: string;
}

export interface BucketSortQuestion extends QuestionBase {
  type: "bucket_sort";
  /** Exactly two — the sort is always a binary split. */
  buckets: [BucketDefinition, BucketDefinition];
  items: BucketItem[];
}

export interface FillBlank {
  id: string;
  correctWord: string;
}

export interface FillBlankQuestion extends QuestionBase {
  type: "fill_blank";
  /** Prompt text with `{{blankId}}` placeholders, one per entry in `blanks`. */
  template: string;
  blanks: FillBlank[];
  /** Word bank shown beneath the sentence — every blank's correct word plus a
   * few distractors, pre-shuffled by whoever authors the fixture. */
  wordBank: string[];
}

export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | MatchingQuestion
  | RangeQuestion
  | SequencingQuestion
  | ThisVsThatQuestion
  | BucketSortQuestion
  | FillBlankQuestion;
