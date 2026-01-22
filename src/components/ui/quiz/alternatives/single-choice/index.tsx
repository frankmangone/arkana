"use client";

import React, { useState } from "react";
import { EQuizResult, QuizBodyProps } from "../../types";
import { SingleChoiceOption } from "./option";
import { Submit } from "../../components/submit";

export const SingleChoiceQuiz: React.FC<QuizBodyProps> = ({
  questionId,
  questionContent,
  dictionary,
  setResult,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setResult(isCorrect ? EQuizResult.Correct : EQuizResult.Incorrect);
  };

  const isAnswerCorrect = (): boolean => {
    if (!selectedAnswer) return false;
    const correctAnswer = questionContent.options.find((opt) => opt.isCorrect);
    return selectedAnswer === correctAnswer?.id;
  };

  const isCorrect = submitted && isAnswerCorrect();

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2 mt-2">
        {questionContent.options.map((option) => (
          <SingleChoiceOption key={option.id} option={option} questionId={questionId} selectedAnswer={selectedAnswer || ""} setSelectedAnswer={setSelectedAnswer} isCorrect={option.isCorrect} submitted={submitted} />
        ))}
      </div>

      <Submit submitted={submitted} handleSubmit={handleSubmit} disabled={!selectedAnswer} dictionary={dictionary} />
    </div>
  );
};

