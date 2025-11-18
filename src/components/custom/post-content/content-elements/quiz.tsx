"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionContent {
  question: string;
  options: QuizOption[];
  feedback: string;
}

export interface QuizQuestion {
  id: string;
  type: "single" | "multiple";
  [lang: string]: QuizQuestionContent | string;
}

interface QuizComponentProps {
  src: string;
  lang?: string;
  dictionary?: {
    submitAnswer: string;
    correct: string;
    almost: string;
    incorrect: string;
  };
}

interface QuestionState {
  [questionId: string]: string[] | null;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ 
  src, 
  lang = "en",
  dictionary = {
    submitAnswer: "Submit Answer",
    correct: "Correct!",
    almost: "Almost!",
    incorrect: "Incorrect"
  }
}) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [answers, setAnswers] = useState<QuestionState>({});
  const [submitted, setSubmitted] = useState<QuestionState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load question from JSON file
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        // Construct the path relative to public directory
        const response = await fetch(`/quizzes/${src}`);
        if (!response.ok) {
          throw new Error(`Failed to load question: ${response.statusText}`);
        }
        const data = await response.json();
        setQuestion(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load question"
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [src]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">Loading question...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-incorrect-400">Error: {error}</div>;
  }

  if (!question) {
    return (
      <div className="p-4 text-center text-gray-400">
        No question data available
      </div>
    );
  }

  // Extract language-specific content
  const questionContent = question[lang] as QuizQuestionContent | undefined;
  if (
    !questionContent ||
    typeof questionContent !== "object" ||
    !("question" in questionContent)
  ) {
    return (
      <div className="p-4 text-center text-incorrect-400">
        Language &apos;{lang}&apos; not available for this question
      </div>
    );
  }

  const questionId = question.id;

  const handleOptionChange = (optionId: string, isChecked: boolean) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (isChecked) {
        return {
          ...prev,
          [questionId]:
            question.type === "single"
              ? [optionId]
              : [...currentAnswers, optionId],
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter((id) => id !== optionId),
        };
      }
    });
  };

  const handleSubmit = () => {
    setSubmitted((prev) => ({
      ...prev,
      [questionId]: answers[questionId] || [],
    }));
  };

  const isAnswerCorrect = (): boolean => {
    const userAnswers = answers[questionId] || [];
    const correctAnswers = questionContent.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    if (userAnswers.length !== correctAnswers.length) return false;
    return userAnswers.every((id) => correctAnswers.includes(id));
  };

  const isAnswerPartiallyCorrect = (): boolean => {
    const userAnswers = answers[questionId] || [];
    const correctAnswers = questionContent.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    if (userAnswers.length === 0) return false;

    // Check if at least one answer is correct
    const hasCorrectAnswer = userAnswers.some((id) =>
      correctAnswers.includes(id)
    );

    // Check if at least one answer is incorrect or if missing correct answers
    const hasMissedOrIncorrect =
      userAnswers.some((id) => !correctAnswers.includes(id)) ||
      userAnswers.length < correctAnswers.length;

    return hasCorrectAnswer && hasMissedOrIncorrect;
  };

  const isSubmitted = submitted[questionId] !== undefined;
  const isCorrect = isSubmitted && isAnswerCorrect();
  const isPartiallyCorrect = isSubmitted && isAnswerPartiallyCorrect();
  const userAnswers = answers[questionId] || [];
  const inputType = question.type === "single" ? "radio" : "checkbox";

  return (
    <div className="my-4 p-0 sm:p-4">
      <div className="p-4 border border-white/20 flex flex-col">
        {/* Question Title */}
        <h4 className="font-semibold text-xl mt-2 mb-4 flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-purple-400" />
          {questionContent.question}
        </h4>

        {/* Options */}
        <div className="space-y-2 mx-4 my-8">
          {questionContent.options.map((option) => {
            const isSelected = userAnswers.includes(option.id);
            const isCorrectOption = option.isCorrect;
            const showFeedback = isSubmitted;

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
                  type={inputType}
                  name={questionId}
                  value={option.id}
                  checked={isSelected}
                  onChange={(e) =>
                    handleOptionChange(option.id, e.target.checked)
                  }
                  disabled={isSubmitted}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-gray-200">{option.text}</span>
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
        {!isSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={userAnswers.length === 0}
            className="px-4 py-6 bg-purple-400 hover:bg-purple-300 cursor-pointer disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-lg transition-colors"
          >
            {dictionary.submitAnswer}
          </Button>
        ) : (
          <div
            className={`p-3 border ${
              isCorrect
                ? "border-correct-600 bg-correct-900/20 text-correct-200"
                : isPartiallyCorrect
                ? "border-yellow-600 bg-yellow-900/20 text-yellow-200"
                : "border-incorrect-600 bg-incorrect-900/20 text-incorrect-200"
            }`}
          >
            <p className="font-semibold mb-1 flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {dictionary.correct}
                </>
              ) : isPartiallyCorrect ? (
                <>
                  <HelpCircle className="w-5 h-5" />
                  {dictionary.almost}
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  {dictionary.incorrect}
                </>
              )}
            </p>
            <p className="text-sm">{questionContent.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
