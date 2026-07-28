"use client";

import { BucketSortQuestionRenderer } from "@/features/quiz/components/bucket-sort-question";
import { ChoiceQuestionRenderer } from "@/features/quiz/components/choice-question";
import { FillBlankQuestionRenderer } from "@/features/quiz/components/fill-blank-question";
import { MatchingQuestionRenderer } from "@/features/quiz/components/matching-question";
import { RangeQuestionRenderer } from "@/features/quiz/components/range-question";
import { SequencingQuestionRenderer } from "@/features/quiz/components/sequencing-question";
import { ThisVsThatQuestionRenderer } from "@/features/quiz/components/this-vs-that-question";
import type {
  AnswerStatus,
  Question,
  QuizzesDictionary,
} from "@/features/quiz/types";

interface QuestionRendererProps {
  question: Question;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

/** Dispatches to the renderer for `question.type`. */
export function QuestionRenderer({
  question,
  dictionary,
  onStatusChange,
}: QuestionRendererProps) {
  switch (question.type) {
    case "single_choice":
    case "multi_choice":
      return (
        <ChoiceQuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={onStatusChange}
        />
      );
    case "sequencing":
      return (
        <SequencingQuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={onStatusChange}
        />
      );
    case "range":
      return (
        <RangeQuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={onStatusChange}
        />
      );
    case "matching":
      return (
        <MatchingQuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={onStatusChange}
        />
      );
    case "this_vs_that":
      return (
        <ThisVsThatQuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={onStatusChange}
        />
      );
    case "bucket_sort":
      return (
        <BucketSortQuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={onStatusChange}
        />
      );
    case "fill_blank":
      return (
        <FillBlankQuestionRenderer
          question={question}
          dictionary={dictionary}
          onStatusChange={onStatusChange}
        />
      );
  }
}
