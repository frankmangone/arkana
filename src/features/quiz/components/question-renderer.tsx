"use client";

import { ChoiceQuestionRenderer } from "@/features/quiz/components/choice-question";
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

/**
 * Dispatches to the renderer for `question.type`. Types without a component
 * yet fall through to a placeholder so the sandbox can list every fixture
 * from day one, even before its renderer exists.
 */
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
    default:
      return (
        <p className="text-sm text-ink-faint italic">
          No renderer built yet for type &quot;{question.type}&quot;.
        </p>
      );
  }
}
