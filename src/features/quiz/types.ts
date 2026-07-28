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

export interface RangeQuestion extends QuestionBase {
  type: "range";
  min: number;
  max: number;
  step: number;
  unit?: string;
  correctValue: number;
  tolerance: number;
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

export interface ScenarioQuestion extends QuestionBase {
  type: "scenario";
  scenario: string;
  options: ChoiceOption[];
  correctOptionIds: string[];
}

export interface SpotTheFlawQuestion extends QuestionBase {
  type: "spot_the_flaw";
  passage: string;
  options: ChoiceOption[];
  correctOptionIds: string[];
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

export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | MatchingQuestion
  | RangeQuestion
  | SequencingQuestion
  | ScenarioQuestion
  | SpotTheFlawQuestion
  | ThisVsThatQuestion;
