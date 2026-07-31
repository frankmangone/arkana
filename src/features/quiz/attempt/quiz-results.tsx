import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GlyphRail } from "@/features/quiz/components/glyph-rail";
import { cn } from "@/lib/utils";
import type { QuizzesDictionary } from "@/features/quiz/types";

const styles = {
  // Same status border + soft-glow formula as the question card's wrapper,
  // so the summary reads as the final card of the same deck.
  wrapper: (passed: boolean) =>
    cn(
      "relative gap-4 overflow-hidden transition-[box-shadow,border-color] duration-500 ease-out",
      passed
        ? "border-teal-400 shadow-[0_4px_40px_-8px_hsla(195,92%,60%,0.35)]"
        : "border-magenta-400 shadow-[0_4px_40px_-8px_hsla(312,92%,60%,0.35)]"
    ),
  // Centered, roomier than a question card - this is a destination view,
  // not another item in the flow.
  content: "flex flex-col items-center gap-4 px-8 py-12 text-center",
  title: "text-2xl font-semibold tracking-tight text-ink-heading",
  score: (passed: boolean) =>
    cn("text-lg font-medium", passed ? "text-teal" : "text-magenta"),
  message: "max-w-[48ch] text-sm text-ink-body",
  review: "mt-2 flex flex-col items-center gap-2",
  reviewHeading: "eyebrow text-ink-muted",
  reviewList: "!m-0 flex list-none flex-col items-center gap-1.5 !p-0",
  reviewItem: "!m-0 before:!content-none",
  reviewLink:
    "text-sm text-primary-700 underline-offset-4 transition-colors hover:text-primary-600 hover:underline",
  // The question card actions' solid look.
  button: "mt-4 w-fit bg-none bg-primary-700 text-ink-on-brand hover:bg-primary-800",
};

interface QuizResultsProps {
  score: number;
  passed: boolean;
  backUrl: string;
  dictionary: QuizzesDictionary;
  /** Articles behind the questions the user missed — empty on a perfect run. */
  reviewLinks?: Array<{ title: string; url: string }>;
}

export function QuizResults({
  score,
  passed,
  backUrl,
  dictionary,
  reviewLinks = [],
}: QuizResultsProps) {
  const results = dictionary.attempt.results;

  return (
    <Card className={styles.wrapper(passed)}>
      <GlyphRail status={passed ? "correct" : "incorrect"} layout="band" />
      <CardContent className={styles.content}>
        <h2 className={styles.title}>{results.title}</h2>
        <p className={styles.score(passed)}>
          {results.score.replace("{score}", String(score))}
        </p>
        <p className={styles.message}>{passed ? results.passed : results.failed}</p>
        {reviewLinks.length > 0 && (
          <div className={styles.review}>
            <span className={styles.reviewHeading}>{results.review}</span>
            <ul className={styles.reviewList}>
              {reviewLinks.map((link) => (
                <li key={link.url} className={styles.reviewItem}>
                  <Link href={link.url} className={styles.reviewLink}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button asChild size="lg" className={styles.button}>
          <Link href={backUrl}>{results.backToReadingList}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
