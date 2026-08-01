import type { QuestionFixture } from "./sandbox-list";

/** A single question exactly as authored in arkana-content's questions/**\/*.json files. */
interface ArkanaContentQuestion {
  slug: string;
  type: string;
  difficulty: 1 | 2 | 3;
  answerKey: Record<string, unknown>;
  translations: Record<
    string,
    {
      prompt: string;
      content: Record<string, unknown>;
    }
  >;
}

/** Top-level shape of an arkana-content questions file. */
interface ArkanaContentFile {
  questions: ArkanaContentQuestion[];
}

function isArkanaContentFile(value: unknown): value is ArkanaContentFile {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { questions?: unknown }).questions)
  );
}

/**
 * Flattens one arkana-content question - `slug`, per-language
 * `translations.<lang>.prompt`/`content`, and a top-level `answerKey` - into
 * the flat `QuestionFixture` shape the sandbox's rendering engine expects.
 * Mirrors `toQuestion()` in `src/lib/api/services/quiz.ts`, which does the
 * same flattening for the real backend's `content`-nested wire format.
 */
function toFixture(question: ArkanaContentQuestion, lang: string): QuestionFixture | null {
  const translation = question.translations[lang];
  if (!translation) return null;

  const { explanation, ...content } = translation.content;

  return {
    id: question.slug,
    type: question.type,
    difficulty: question.difficulty,
    prompt: translation.prompt,
    answerKey: question.answerKey,
    explanation: explanation as string | undefined,
    ...content,
  } as unknown as QuestionFixture;
}

/**
 * Parses a single arkana-content questions file (the `{ "questions": [...] }`
 * envelope from arkana-content/questions/**\/*.json) into sandbox fixtures,
 * picking one language's translation per question. Returns `null` if the
 * parsed JSON isn't in this format, so the caller can fall back or skip it.
 */
export function parseArkanaContentFile(
  parsed: unknown,
  lang = "en"
): QuestionFixture[] | null {
  if (!isArkanaContentFile(parsed)) return null;

  return parsed.questions
    .map((question) => toFixture(question, lang))
    .filter((fixture): fixture is QuestionFixture => fixture !== null);
}
