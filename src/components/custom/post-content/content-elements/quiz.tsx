"use client";

import { Button } from "@/components/ui/button";
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
}

interface QuestionState {
  [questionId: string]: string[] | null;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ src, lang = "en" }) => {
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
    return <div className="p-4 text-center text-red-400">Error: {error}</div>;
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
      <div className="p-4 text-center text-red-400">
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

  const isSubmitted = submitted[questionId] !== undefined;
  const isCorrect = isSubmitted && isAnswerCorrect();
  const userAnswers = answers[questionId] || [];
  const inputType = question.type === "single" ? "radio" : "checkbox";

  return (
    <div className="my-8 p-4">
      <div className="p-4 bg-purple-800/20 rounded border border-purple-700">
        {/* Question Title */}
        <h4 className="font-semibold text-xl text-purple-300 mb-4">
          {questionContent.question}
        </h4>

        {/* Options */}
        <div className="space-y-2 mx-4 my-8">
          {questionContent.options.map((option) => {
            const isSelected = userAnswers.includes(option.id);
            const isCorrectOption = option.isCorrect;
            const showFeedback = isSubmitted;

            const optionClassName =
              "flex items-center gap-2 p-3 rounded border cursor-pointer transition-colors";
            let borderClass =
              "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50";

            if (showFeedback && isSelected && isCorrectOption) {
              borderClass = "border-green-600 bg-green-900/20";
            } else if (showFeedback && isSelected && !isCorrectOption) {
              borderClass = "border-red-600 bg-red-900/20";
            } else if (showFeedback && isCorrectOption) {
              borderClass = "border-green-600/50 bg-green-900/10";
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
                  <span className="ml-auto text-green-400 text-sm">
                    ✓ Correct
                  </span>
                )}
                {showFeedback && isSelected && isCorrectOption && (
                  <span className="ml-auto text-green-400 text-sm">
                    ✓ Correct
                  </span>
                )}
                {showFeedback && isSelected && !isCorrectOption && (
                  <span className="ml-auto text-red-400 text-sm">
                    ✗ Incorrect
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
            className="px-4 py-2 bg-purple-500 hover:bg-purple-400 cursor-pointer disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            Submit Answer
          </Button>
        ) : (
          <div
            className={`p-3 rounded border ${
              isCorrect
                ? "border-green-600 bg-green-900/20 text-green-200"
                : "border-red-600 bg-red-900/20 text-red-200"
            }`}
          >
            <p className="font-semibold mb-1">
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            <p className="text-sm">{questionContent.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
