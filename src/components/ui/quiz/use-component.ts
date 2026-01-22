import { useState, useEffect } from "react";
import { QuizQuestion, QuizQuestionContent } from "./types";

interface UseQuizComponentReturn {
  question: QuizQuestion | null;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  toggleQuiz: () => void;
  questionContent: QuizQuestionContent | null;
  languageError: string | null;
}

export function useQuizComponent(
  src: string,
  lang: string
): UseQuizComponentReturn {
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

  // Extract language-specific content
  const rawQuestionContent = question
    ? (question[lang] as QuizQuestionContent | undefined)
    : undefined;

  // Validate language-specific content
  const languageError =
    question && (!rawQuestionContent ||
    typeof rawQuestionContent !== "object" ||
    !("question" in rawQuestionContent))
      ? `Language '${lang}' not available for this question`
      : null;

  const questionContent: QuizQuestionContent | null = languageError
    ? null
    : rawQuestionContent || null;

  const toggleQuiz = () => {
    setIsOpen(!isOpen);
  };

  return {
    question,
    loading,
    error,
    isOpen,
    toggleQuiz,
    questionContent,
    languageError,
  };
}
