import type {
  AnswerKey,
  AssignmentsAnswerKey,
  AssignmentsResponse,
  ChoiceAnswerKey,
  ChoiceResponse,
  FillBlankAnswerKey,
  FillBlankResponse,
  QuestionResponse,
  RangeAnswerKey,
  RangeResponse,
  SequencingAnswerKey,
  SequencingResponse,
} from "@/features/quiz/types";
import { QUESTION_TYPES } from "./enums";

// Mirrors features/quizzes/services/grading.go exactly, so the sandbox's
// local grading and the real backend's server-side grading can never
// disagree on what counts as correct.

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const v of a) counts.set(v, (counts.get(v) ?? 0) + 1);
  for (const v of b) counts.set(v, (counts.get(v) ?? 0) - 1);
  return [...counts.values()].every((n) => n === 0);
}

function gradeChoice(key: ChoiceAnswerKey, response: ChoiceResponse): boolean {
  return sameSet(key.correctOptionIds, response.selectedOptionIds);
}

function gradeAssignments(key: AssignmentsAnswerKey, response: AssignmentsResponse): boolean {
  const wanted = Object.entries(key.correctAssignments);
  if (wanted.length !== Object.keys(response.assignments).length) return false;
  return wanted.every(([id, want]) => response.assignments[id] === want);
}

function gradeRange(key: RangeAnswerKey, response: RangeResponse): boolean {
  return Object.entries(key.correctValues).every(([id, want]) => {
    const got = response.values[id];
    if (got === undefined) return false;
    return Math.abs(got - want.value) <= want.tolerance;
  });
}

function gradeSequencing(key: SequencingAnswerKey, response: SequencingResponse): boolean {
  if (key.correctOrder.length !== response.order.length) return false;
  return key.correctOrder.every((id, i) => response.order[i] === id);
}

function gradeFillBlank(key: FillBlankAnswerKey, response: FillBlankResponse): boolean {
  const wanted = Object.entries(key.correctWords);
  if (wanted.length !== Object.keys(response.filled).length) return false;
  return wanted.every(([id, want]) => response.filled[id] === want);
}

function grade(type: string, answerKey: AnswerKey, response: QuestionResponse): boolean {
  switch (type) {
    case QUESTION_TYPES.SINGLE_CHOICE:
    case QUESTION_TYPES.MULTI_CHOICE:
      return gradeChoice(answerKey as ChoiceAnswerKey, response as ChoiceResponse);
    case QUESTION_TYPES.MATCHING:
    case QUESTION_TYPES.BUCKET_SORT:
      return gradeAssignments(answerKey as AssignmentsAnswerKey, response as AssignmentsResponse);
    case QUESTION_TYPES.RANGE:
      return gradeRange(answerKey as RangeAnswerKey, response as RangeResponse);
    case QUESTION_TYPES.SEQUENCING:
      return gradeSequencing(answerKey as SequencingAnswerKey, response as SequencingResponse);
    case QUESTION_TYPES.FILL_IN_THE_BLANKS:
      return gradeFillBlank(answerKey as FillBlankAnswerKey, response as FillBlankResponse);
    default:
      return false;
  }
}

/**
 * Builds a `CheckAnswer` for the dev sandbox: grades synchronously (wrapped
 * in a resolved Promise to match the real attempt's async contract) against
 * a fixture's embedded answer key, returning the exact same result shape a
 * real backend round-trip would.
 */
export function localCheckAnswer(
  type: string,
  answerKey: AnswerKey,
  explanation: string | undefined,
  response: QuestionResponse
): Promise<{ correct: boolean; correctReveal?: AnswerKey; explanation?: string }> {
  const correct = grade(type, answerKey, response);
  return Promise.resolve({
    correct,
    correctReveal: correct ? undefined : answerKey,
    explanation: correct ? undefined : explanation,
  });
}
