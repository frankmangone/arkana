"use client";

import { useState } from "react";
import { QuestionCard } from "@/features/quiz/components/question-card";
import { localCheckAnswer } from "@/features/quiz/lib/local-grading";
import type {
  AnswerKey,
  AnswerStatus,
  Question,
  QuizzesDictionary,
} from "@/features/quiz/types";

/** A fixture is a real Question plus the answer key/explanation the real
 * backend would never deliver upfront - sandbox-only, since it's graded
 * locally instead of via a server round-trip. */
export type QuestionFixture = Question & {
  answerKey: AnswerKey;
  explanation?: string;
};

// Flip to false to preview the no-retry mode a real graded attempt would use.
const ALLOW_RETRY = false;

interface SandboxCardProps {
  fixture: QuestionFixture;
  dictionary: QuizzesDictionary;
}

function SandboxCard({ fixture, dictionary }: SandboxCardProps) {
  // The card's action labels are the parent's job now - track each card's
  // answer status so the left button can read Check answer / Try again / Reset.
  const [status, setStatus] = useState<AnswerStatus>("idle");

  const label =
    !ALLOW_RETRY || status === "idle"
      ? dictionary.checkAnswer
      : status === "correct"
        ? dictionary.reset
        : dictionary.tryAgain;

  return (
    <QuestionCard
      question={fixture}
      dictionary={dictionary}
      allowRetry={ALLOW_RETRY}
      rightAction={{ label }}
      onAnswered={(correct) => setStatus(correct ? "correct" : "incorrect")}
      onRetry={() => setStatus("idle")}
      checkAnswer={(response) =>
        localCheckAnswer(fixture.type, fixture.answerKey, fixture.explanation, response)
      }
    />
  );
}

interface SandboxListProps {
  fixtures: QuestionFixture[];
  dictionary: QuizzesDictionary;
}

export function SandboxList({ fixtures, dictionary }: SandboxListProps) {
  return (
    <div className="mt-10 flex flex-col gap-8">
      {fixtures.map((fixture) => (
        <SandboxCard key={fixture.id} fixture={fixture} dictionary={dictionary} />
      ))}
    </div>
  );
}
