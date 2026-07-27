import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { QuestionCard } from "@/features/quiz/components/question-card";
import { getDictionary } from "@/lib/dictionaries";
import type { Question } from "@/features/quiz/types";

/**
 * Fixtures live in the gitignored src/data/quiz-fixtures — read at runtime,
 * never statically imported, so a missing directory (any checkout other than
 * a machine that authored fixtures locally) can't break the build. This code
 * path is only reached once NEXT_PUBLIC_DEV_MODE has already gated it below.
 */
function loadFixtures(): Question[] {
  const fixturesDir = path.join(process.cwd(), "src", "data", "quiz-fixtures");

  let files: string[];
  try {
    files = fs
      .readdirSync(fixturesDir)
      .filter((file) => file.endsWith(".json"));
  } catch {
    return [];
  }

  return files
    .map(
      (file) =>
        JSON.parse(
          fs.readFileSync(path.join(fixturesDir, file), "utf-8")
        ) as Question
    )
    .sort((a, b) => a.type.localeCompare(b.type));
}

export default async function QuizSandboxPage() {
  if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") {
    return notFound();
  }

  const questions = loadFixtures();
  const dictionary = await getDictionary("en");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="eyebrow text-ink-faint">Arkana · Dev sandbox</span>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-heading">
        Quiz components
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Dev-only — gated by <code>NEXT_PUBLIC_DEV_MODE</code>, never shipped in
        a real build. Renders every fixture from{" "}
        <code>src/data/quiz-fixtures</code>.
      </p>

      {questions.length === 0 ? (
        <p className="mt-8 text-sm text-ink-faint italic">
          No fixtures found in src/data/quiz-fixtures.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-8">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              dictionary={dictionary.quizzes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
