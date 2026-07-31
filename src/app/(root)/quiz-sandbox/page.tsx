import fs from "fs";
import path from "path";
import { getDictionary } from "@/lib/dictionaries";
import { SandboxList, type QuestionFixture } from "./sandbox-list";

/**
 * Fixtures live in src/data/quiz-fixtures - read at build time (this is a
 * static export, so there's no live server reading these per-request), never
 * statically imported. The try/catch is just a defensive fallback; the
 * directory is committed, so it should always be present.
 */
function loadFixtures(): QuestionFixture[] {
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
    .flatMap((file) => {
      const parsed = JSON.parse(
        fs.readFileSync(path.join(fixturesDir, file), "utf-8")
      ) as QuestionFixture | QuestionFixture[];
      return Array.isArray(parsed) ? parsed : [parsed];
    })
    .sort((a, b) => a.type.localeCompare(b.type));
}

export default async function QuizSandboxPage() {
  const fixtures = loadFixtures();
  const dictionary = await getDictionary("en");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="eyebrow text-ink-faint">Arkana · Dev sandbox</span>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-heading">
        Quiz components
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Unlisted - not linked from anywhere in the site, but part of the real
        build. Renders every fixture from <code>src/data/quiz-fixtures</code>.
      </p>

      {fixtures.length === 0 ? (
        <p className="mt-8 text-sm text-ink-faint italic">
          No fixtures found in src/data/quiz-fixtures.
        </p>
      ) : (
        <SandboxList fixtures={fixtures} dictionary={dictionary.quizzes} />
      )}
    </div>
  );
}
