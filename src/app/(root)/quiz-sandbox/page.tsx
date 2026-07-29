import fs from "fs";
import path from "path";
import { QuestionCard } from "@/features/quiz/components/question-card";
import { getDictionary } from "@/lib/dictionaries";
import type { Question } from "@/features/quiz/types";

/**
 * Fixtures live in src/data/quiz-fixtures — read at build time (this is a
 * static export, so there's no live server reading these per-request), never
 * statically imported. The try/catch is just a defensive fallback; the
 * directory is committed, so it should always be present.
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

// Flip to false to preview the no-retry mode a real graded attempt would use.
const ALLOW_RETRY = false;

export default async function QuizSandboxPage() {
  const questions = loadFixtures();
  const dictionary = await getDictionary("en");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="eyebrow text-ink-faint">Arkana · Dev sandbox</span>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-heading">
        Quiz components
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Unlisted — not linked from anywhere in the site, but part of the real
        build. Renders every fixture from <code>src/data/quiz-fixtures</code>.
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
              allowRetry={ALLOW_RETRY}
            />
          ))}
        </div>
      )}
    </div>
  );
}
