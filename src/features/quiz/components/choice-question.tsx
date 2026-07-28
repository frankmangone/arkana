"use client";

import { OptionPicker } from "@/features/quiz/components/option-picker";
import type {
  AnswerStatus,
  MultiChoiceQuestion,
  QuizzesDictionary,
  SingleChoiceQuestion,
} from "@/features/quiz/types";

interface ChoiceQuestionProps {
  question: SingleChoiceQuestion | MultiChoiceQuestion;
  dictionary: QuizzesDictionary;
  onStatusChange?: (status: AnswerStatus) => void;
}

export function ChoiceQuestionRenderer({
  question,
  dictionary,
  onStatusChange,
}: ChoiceQuestionProps) {
  const allowMultiple = question.type === "multi_choice";

  return (
    <OptionPicker
      hint={allowMultiple ? dictionary.multiChoiceHint : dictionary.singleChoiceHint}
      options={question.options}
      correctOptionIds={question.correctOptionIds}
      allowMultiple={allowMultiple}
      explanation={question.explanation}
      dictionary={dictionary}
      onStatusChange={onStatusChange}
    />
  );
}
