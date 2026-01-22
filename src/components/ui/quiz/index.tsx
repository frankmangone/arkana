"use client";

import React from "react";
import { QuizDictionary } from "./types";
import { QuizHeader } from "./components/header";
import { useQuizComponent } from "./use-component";
import { QuizContent } from "./components/content";

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
  const {
    question,
    loading,
    error,
    isOpen,
    toggleQuiz,
    questionContent,
    languageError,
  } = useQuizComponent(src, lang);

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

  if (languageError || !questionContent) {
    return (
      <div className="p-4 text-center text-incorrect-400">
        {languageError || "Language content not available"}
      </div>
    );
  }

  return (
    <div className="quiz-container my-12 p-0 flex flex-col relative items-center">
      <QuizHeader isOpen={isOpen} toggleQuiz={toggleQuiz} />
      <QuizContent isOpen={isOpen} questionId={question.id} questionType={question.type} questionContent={questionContent} dictionary={dictionary} />
    </div>
  );
};

export default QuizComponent;

