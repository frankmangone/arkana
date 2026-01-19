"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { QuizBodyProps } from "../types";
import { LatexText } from "../latex-text";

export const MultipleChoiceQuiz: React.FC<QuizBodyProps> = ({
  questionId,
  questionContent,
  dictionary,
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

  const handleSubmit = () => {
    setSubmitted(true);
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

  const isCorrect = submitted && isAnswerCorrect();
  const isPartiallyCorrect = submitted && isAnswerPartiallyCorrect();

  return (
    <div className="p-4 border-t border-white/20">
      {/* Question Title */}
      <h4 className="font-semibold text-xl mb-4">
        <LatexText>{questionContent.question}</LatexText>
      </h4>

      {/* Options */}
      <div className="space-y-2 mx-4 my-8">
        {questionContent.options.map((option) => {
          const isSelected = selectedAnswers.includes(option.id);
          const isCorrectOption = option.isCorrect;
          const showFeedback = submitted;

          const optionClassName =
            "flex items-center gap-2 p-3 border cursor-pointer transition-colors";
          let borderClass =
            "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50";

          if (showFeedback && isSelected && isCorrectOption) {
            borderClass = "border-correct-600 bg-correct-900/20";
          } else if (showFeedback && isSelected && !isCorrectOption) {
            borderClass = "border-incorrect-600 bg-incorrect-900/20";
          } else if (showFeedback && isCorrectOption) {
            borderClass = "border-correct-600/20 bg-correct-900/10";
          }

          return (
            <label
              key={option.id}
              className={`${optionClassName} ${borderClass}`}
            >
              <input
                type="checkbox"
                name={questionId}
                value={option.id}
                checked={isSelected}
                onChange={(e) =>
                  handleOptionChange(option.id, e.target.checked)
                }
                disabled={submitted}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-200">
                <LatexText>{option.text}</LatexText>
              </span>
              {showFeedback && isCorrectOption && !isSelected && (
                <span className="ml-auto text-correct-400/60 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                </span>
              )}
              {showFeedback && isSelected && isCorrectOption && (
                <span className="ml-auto text-correct-400 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                </span>
              )}
              {showFeedback && isSelected && !isCorrectOption && (
                <span className="ml-auto text-incorrect-400 text-sm flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* Submit Button and Feedback */}
      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={selectedAnswers.length === 0}
          className="px-4 py-6 bg-purple-400 hover:bg-purple-300 cursor-pointer disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-lg transition-colors"
        >
          {dictionary.submitAnswer}
        </Button>
      ) : (
        <div
          className={`p-3 border ${
            isCorrect
              ? "border-correct-600 text-correct-200"
              : isPartiallyCorrect
              ? "border-yellow-600 text-yellow-200"
              : "border-incorrect-600 text-incorrect-200"
          }`}
        >
          <p className="font-semibold mb-1">
            {isCorrect ? (
              <span className="text-correct-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="mt-[2px]">{dictionary.correct}</span>
              </span>
            ) : isPartiallyCorrect ? (
              <span className="text-yellow-600 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <span className="mt-[2px]">{dictionary.almost}</span>
              </span>
            ) : (
              <span className="text-incorrect-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span className="mt-[2px]">{dictionary.incorrect}</span>
              </span>
            )}
          </p>
          <p className="text-sm">
            <LatexText>{questionContent.feedback}</LatexText>
          </p>
        </div>
      )}
    </div>
  );
};

