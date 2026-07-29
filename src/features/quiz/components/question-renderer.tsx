"use client";

import { BucketSortQuestionRenderer } from "@/features/quiz/components/bucket-sort-question";
import { ChoiceQuestionRenderer } from "@/features/quiz/components/choice-question";
import { FillBlankQuestionRenderer } from "@/features/quiz/components/fill-blank-question";
import { MatchingQuestionRenderer } from "@/features/quiz/components/matching-question";
import { RangeQuestionRenderer } from "@/features/quiz/components/range-question";
import { SequencingQuestionRenderer } from "@/features/quiz/components/sequencing-question";
import { QUESTION_TYPES } from "../lib/enums";
import type { Question, QuizzesDictionary } from "@/features/quiz/types";

interface QuestionRendererProps {
  question: Question;
  dictionary: QuizzesDictionary;
}

/** Dispatches to the renderer for `question.type`. */
export function QuestionRenderer({ question, dictionary }: QuestionRendererProps) {
  switch (question.type) {
    case QUESTION_TYPES.SINGLE_CHOICE:
    case QUESTION_TYPES.MULTI_CHOICE:
      return <ChoiceQuestionRenderer question={question} dictionary={dictionary} />;
    case QUESTION_TYPES.SEQUENCING:
      return <SequencingQuestionRenderer question={question} dictionary={dictionary} />;
    case QUESTION_TYPES.RANGE:
      return <RangeQuestionRenderer question={question} dictionary={dictionary} />;
    case QUESTION_TYPES.MATCHING:
      return <MatchingQuestionRenderer question={question} dictionary={dictionary} />;
    case QUESTION_TYPES.BUCKET_SORT:
      return <BucketSortQuestionRenderer question={question} dictionary={dictionary} />;
    case QUESTION_TYPES.FILL_IN_THE_BLANKS:
      return <FillBlankQuestionRenderer question={question} dictionary={dictionary} />;
  }
}
