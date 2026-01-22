"use client";

import React, { useState } from "react";
import { EQuizResult, QuizBodyProps } from "../../types";
import { MultipleChoiceOption } from "./option";
import { Submit } from "../../components/submit";

export const MultipleChoiceQuiz: React.FC<QuizBodyProps> = ({
  questionId,
  questionContent,
  dictionary,
  setResult,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleOptionChange = (optionId: string, isChecked: boolean) => {
    setSelectedAnswers((prev) => {
      if (isChecked) {
        return [...prev, optionId];
      } else {
        return prev.filter((id) => id !== optionId);
      }
    });
  };

  const isAnswerCorrect = (): boolean => {
    const correctAnswers = questionContent.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    if (selectedAnswers.length !== correctAnswers.length) return false;
    return selectedAnswers.every((id) => correctAnswers.includes(id));
  };

  const isAnswerPartiallyCorrect = (): boolean => {
    if (selectedAnswers.length === 0) return false;

    const correctAnswers = questionContent.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    // Check if at least one answer is correct
    const hasCorrectAnswer = selectedAnswers.some((id) =>
      correctAnswers.includes(id)
    );

    // Check if at least one answer is incorrect or if missing correct answers
    const hasMissedOrIncorrect =
      selectedAnswers.some((id) => !correctAnswers.includes(id)) ||
      selectedAnswers.length < correctAnswers.length;

    return hasCorrectAnswer && hasMissedOrIncorrect;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    
    const isCorrect = isAnswerCorrect();
    const isPartiallyCorrect = isAnswerPartiallyCorrect();

    if (isCorrect) {
      setResult(EQuizResult.Correct);
    } else if (isPartiallyCorrect) {
      setResult(EQuizResult.PartiallyCorrect);
    } else {
      setResult(EQuizResult.Incorrect);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2 mt-2">
        {questionContent.options.map((option) => (
          <MultipleChoiceOption
            key={option.id}
            option={option}
            questionId={questionId}
            selectedAnswers={selectedAnswers}
            handleOptionChange={handleOptionChange}
            isCorrect={option.isCorrect}
            submitted={submitted}
          />
        ))}
      </div>

      <Submit submitted={submitted} handleSubmit={handleSubmit} disabled={selectedAnswers.length === 0} dictionary={dictionary} />
    </div>
  );
};

