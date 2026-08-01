"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, SkipForward } from "lucide-react";
import {
  useCompleteAttempt,
  useNextQuestion,
  useSkipQuestion,
  useSubmitAnswer,
} from "@/lib/api";
import {
  startAttempt,
  toQuestion,
  type CompleteAttemptResponse,
  type StartAttemptResponse,
} from "@/lib/api/services/quiz";
import { QuestionCard } from "@/features/quiz/components/question-card";
import { QuizProgressBar } from "./quiz-progress-bar";
import { QuizResults } from "./quiz-results";
import type { QuestionResponse, QuizzesDictionary } from "@/features/quiz/types";

export interface ReviewTarget {
  title: string;
  url: string;
}

interface QuizAttemptViewProps {
  lang: string;
  listSlug: string;
  moduleSlug: string;
  backUrl: string;
  dictionary: QuizzesDictionary;
  /** Post path → article link, used to turn each missed question's
   * reinforcement posts into review pointers on the results card. */
  reviewTargets: Record<string, ReviewTarget>;
}

export function QuizAttemptView({
  lang,
  listSlug,
  moduleSlug,
  backUrl,
  dictionary,
  reviewTargets,
}: QuizAttemptViewProps) {
  const completeAttempt = useCompleteAttempt();
  const submitAnswer = useSubmitAnswer();
  const skipQuestion = useSkipQuestion();

  const [attempt, setAttempt] = useState<StartAttemptResponse | null>(null);
  const [startFailed, setStartFailed] = useState(false);
  const startRef = useRef<Promise<StartAttemptResponse> | null>(null);

  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<CompleteAttemptResponse | null>(null);
  const completingRef = useRef(false);

  // Starting an attempt is a POST with side effects, so it must run exactly
  // once per mount - but a mutation fired from a ref-guarded effect never
  // delivers its result under StrictMode's double effect pass (the ref skips
  // the surviving pass). Instead, dedupe the request itself in a ref and let
  // every effect pass subscribe to the same promise.
  useEffect(() => {
    startRef.current ??= startAttempt(listSlug, moduleSlug);
    let cancelled = false;
    startRef.current.then(
      (data) => {
        if (!cancelled) setAttempt(data);
      },
      () => {
        if (!cancelled) setStartFailed(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [listSlug, moduleSlug]);

  const attemptId = attempt?.attemptId;

  const next = useNextQuestion({
    attemptId,
    lang,
    enabled: !!attemptId && !results,
  });

  // Every answer is already submitted the moment "Check answer" is clicked
  // inside the card (that's what advances the server's position) - once a
  // refetch reports `done`, there's nothing left to show, so finalize here
  // rather than waiting on another user click.
  useEffect(() => {
    if (!next.data?.done || !attemptId || completingRef.current) return;
    completingRef.current = true;
    completeAttempt.mutate(attemptId, {
      onSuccess: (result) => setResults(result),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next.data?.done, attemptId]);

  const handleContinue = async () => {
    setAnswered(false);
    await next.refetch();
  };

  // Scroll back to the top on every new question - especially important on
  // mobile, where the previous question's card can leave the viewport
  // scrolled deep into the page.
  const currentQuestionId = next.data?.question?.uuid;
  useEffect(() => {
    if (!currentQuestionId) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentQuestionId]);

  if (startFailed || next.isError || completeAttempt.isError || skipQuestion.isError) {
    return <p className="text-sm text-magenta">{dictionary.attempt.error}</p>;
  }

  if (results) {
    return (
      <QuizResults
        score={results.score}
        passed={results.passed}
        backUrl={backUrl}
        dictionary={dictionary}
        reviewLinks={results.reviewPostPaths
          .map((path) => reviewTargets[path])
          .filter((target): target is ReviewTarget => target !== undefined)}
      />
    );
  }

  if (!attemptId) {
    return <p className="text-sm text-ink-faint">{dictionary.attempt.starting}</p>;
  }

  if (next.isLoading || !next.data || next.data.done || !next.data.question) {
    return <p className="text-sm text-ink-faint">{dictionary.attempt.loading}</p>;
  }

  const { question, position, totalQuestions } = next.data;

  const handleSkip = () => {
    skipQuestion.mutate(
      { attemptId, questionId: question.uuid, lang },
      { onSuccess: () => next.refetch() }
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <QuizProgressBar
        position={position}
        total={totalQuestions}
        label={dictionary.attempt.questionProgress
          .replace("{current}", String(position + 1))
          .replace("{total}", String(totalQuestions))}
      />

      <QuestionCard
        key={question.uuid}
        question={toQuestion(question)}
        dictionary={dictionary}
        allowRetry={false}
        leftAction={{
          label: dictionary.attempt.skip,
          onClick: handleSkip,
          icon: SkipForward,
          variant: "ghost" as const,
          // Disabled once answered (kept visible, just dimmed), and during an
          // in-flight check or skip — either would race the server's position.
          disabled: answered || submitAnswer.isPending || skipQuestion.isPending,
        }}
        rightAction={
          answered
            ? { label: dictionary.attempt.continue, onClick: handleContinue, icon: ArrowRight }
            : { label: dictionary.checkAnswer }
        }
        onAnswered={() => setAnswered(true)}
        checkAnswer={async (response: QuestionResponse) => {
          const result = await submitAnswer.mutateAsync({
            attemptId,
            questionId: question.uuid,
            response,
            lang,
          });
          return {
            correct: result.correct,
            correctReveal: result.correctReveal,
            explanation: result.explanation,
          };
        }}
      />
    </div>
  );
}
