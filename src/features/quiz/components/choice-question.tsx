"use client";

import { OptionPicker } from "@/features/quiz/components/option-picker";
import type {
  MultiChoiceQuestion,
  QuizzesDictionary,
  SingleChoiceQuestion,
} from "@/features/quiz/types";

interface ChoiceQuestionProps {
  question: SingleChoiceQuestion | MultiChoiceQuestion;
  dictionary: QuizzesDictionary;
}

export function ChoiceQuestionRenderer({
  question,
  dictionary,
}: ChoiceQuestionProps) {
  const allowMultiple = question.type === "multi_choice";

  return (
    <OptionPicker
      hint={allowMultiple ? dictionary.multiChoiceHint : dictionary.singleChoiceHint}
      options={question.options}
      allowMultiple={allowMultiple}
    />
  );
}
