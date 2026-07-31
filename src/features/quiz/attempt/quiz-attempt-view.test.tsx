import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockStartAttempt = vi.fn();
const mockGetNextQuestion = vi.fn();

vi.mock("@/lib/api/services/quiz", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/services/quiz")>();
  return {
    ...actual,
    startAttempt: (...args: unknown[]) => mockStartAttempt(...args),
    getNextQuestion: (...args: unknown[]) => mockGetNextQuestion(...args),
  };
});

import { QuizAttemptView } from "./quiz-attempt-view";
import type { QuizzesDictionary } from "@/features/quiz/types";

const dictionary = {
  attempt: {
    starting: "Preparing your quiz...",
    loading: "Loading question...",
    questionProgress: "Question {current} of {total}",
    continue: "Continue",
    skip: "Skip",
    error: "Something went wrong loading the quiz. Please try again.",
    results: {
      title: "Quiz complete!",
      score: "Your score: {score}%",
      passed: "passed",
      failed: "failed",
      backToReadingList: "Back",
    },
  },
  checkAnswer: "Check answer",
  tryAgain: "Try again",
  reset: "Reset",
  correct: "Correct!",
  incorrect: "Incorrect",
  singleChoiceHint: "Choose one answer.",
  difficulty: { "1": "Easy", "2": "Medium", "3": "Hard" },
  types: { single_choice: "Single choice" },
} as unknown as QuizzesDictionary;

describe("QuizAttemptView", () => {
  beforeEach(() => {
    mockStartAttempt.mockReset();
    mockGetNextQuestion.mockReset();
  });

  it("starts an attempt then fetches the first question", async () => {
    mockStartAttempt.mockResolvedValue({ attemptId: "att-1", totalQuestions: 8 });
    mockGetNextQuestion.mockResolvedValue({
      question: {
        uuid: "q-1",
        type: "single_choice",
        difficulty: 1,
        prompt: "What is 2 + 2?",
        content: {
          options: [
            { id: "a", label: "3" },
            { id: "b", label: "4" },
          ],
        },
      },
      position: 0,
      totalQuestions: 8,
      done: false,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <QuizAttemptView
            lang="en"
            listSlug="cryptography-101"
            moduleSlug="asymmetric-cryptography-basics"
            backUrl="/en/reading-lists/cryptography-101"
            dictionary={dictionary}
          />
        </QueryClientProvider>
      </StrictMode>
    );

    expect(await screen.findByText("What is 2 + 2?")).toBeInTheDocument();
    expect(mockStartAttempt).toHaveBeenCalledWith(
      "cryptography-101",
      "asymmetric-cryptography-basics"
    );
    // StrictMode double-invokes mount effects - the attempt POST has side
    // effects and must still only fire once.
    expect(mockStartAttempt).toHaveBeenCalledTimes(1);

    // Both card actions render: Check answer on the left, Skip on the right
    // (Skip only becomes Continue once the question is answered).
    expect(screen.getByRole("button", { name: "Check answer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
    expect(mockGetNextQuestion).toHaveBeenCalledWith("att-1", "en");
  });
});
