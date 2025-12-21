"use client";

import { HelpCircle, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { QuizQuestion, QuizQuestionContent, QuizDictionary } from "./types";
import { SingleChoiceQuiz } from "./alternatives/single-choice";
import { MultipleChoiceQuiz } from "./alternatives/multiple-choice";

interface QuizComponentProps {
  src: string;
  lang?: string;
  dictionary?: QuizDictionary;
}

const defaultDictionary: QuizDictionary = {
  submitAnswer: "Submit Answer",
  correct: "Correct!",
  almost: "Almost!",
  incorrect: "Incorrect",
  multipleChoice: "Multiple Choice",
  singleChoice: "Single Choice",
};

const QuizComponent: React.FC<QuizComponentProps> = ({
  src,
  lang = "en",
  dictionary = defaultDictionary,
}) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="my-4 p-0 sm:p-4">
      <div className="border border-white/20 bg-purple-200/10 flex flex-col">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer w-full text-left"
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6 shrink-0 text-purple-400" />
          ) : (
            <ChevronRight className="w-6 h-6 shrink-0 text-purple-400" />
          )}
          <HelpCircle className="w-6 h-6 shrink-0 text-purple-400" />
          <div className="flex-1 flex items-center gap-3">
            <span className="font-semibold text-lg text-purple-300">Quiz</span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                question.type === "multiple"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              }`}
            >
              {question.type === "multiple"
                ? dictionary.multipleChoice
                : dictionary.singleChoice}
            </span>
          </div>
        </button>

        {/* Quiz Content - Render appropriate quiz type */}
        {isOpen &&
          (question.type === "single" ? (
            <SingleChoiceQuiz
              questionId={question.id}
              questionContent={questionContent}
              dictionary={dictionary}
            />
          ) : (
            <MultipleChoiceQuiz
              questionId={question.id}
              questionContent={questionContent}
              dictionary={dictionary}
            />
          ))}
      </div>
    </div>
  );
};

export default QuizComponent;

