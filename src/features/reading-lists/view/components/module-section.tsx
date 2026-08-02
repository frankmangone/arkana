import { useRouter } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useQuizAvailability } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { withLocalePath } from "@/lib/site-config";
import { TakeQuizButton } from "@/features/quiz/components/take-quiz-button";
import { StepItem } from "./step-item";
import type { ModuleData } from "./journey-stepper";

interface ModuleSectionProps {
  lang: string;
  listSlug: string;
  module: ModuleData;
  moduleNumber: number;
  moduleLabel: string;
  readLabel: string;
  takeQuizLabel: string;
  /** Per-slug read status for the logged-in user. Undefined for guests - no progress shown. */
  readStatuses?: Record<string, boolean>;
}

export function ModuleSection(props: ModuleSectionProps) {
  const { lang, listSlug, module, moduleNumber, moduleLabel, readLabel, takeQuizLabel, readStatuses } = props;

  const readCount = readStatuses
    ? module.steps.filter((step) => readStatuses[step.postPath]).length
    : undefined;
  const allRead = readCount !== undefined && readCount === module.steps.length;
  const isRead = (index: number) => !!readStatuses?.[module.steps[index]?.postPath];

  const { data: quizAvailability } = useQuizAvailability({
    listSlug,
    moduleSlug: module.slug,
  });
  const quizAvailable = !!quizAvailability?.available && quizAvailability.languages.includes(lang);

  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const router = useRouter();
  const quizUrl = withLocalePath(lang, `reading-lists/${listSlug}/quiz/${module.slug}`);

  const handleTakeQuiz = () => {
    if (!user) {
      requireAuth();
      return;
    }
    router.push(quizUrl);
  };

  return (
    <section className="grid gap-2 md:grid-cols-[2fr_3fr] md:gap-x-12">
      <div>
        <div className="flex items-center gap-6">
          <span className="eyebrow text-ink-faint">
            {moduleLabel} {String(moduleNumber).padStart(2, "0")}
          </span>
          <span className="inline-flex items-center text-xs text-ink-faint">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {module.readingTime}
          </span>
          {readCount !== undefined && (
            <span
              className={`inline-flex items-center text-xs ${
                allRead ? "text-primary-700" : "text-ink-faint"
              }`}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              {readCount}/{module.steps.length} {readLabel}
            </span>
          )}
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-heading">
          {module.title}
        </h2>
        <p className="mt-1 max-w-[65ch] text-base text-ink-muted">
          {module.description}
        </p>
        {quizAvailable && (
          <TakeQuizButton className="mx-auto mt-8" label={takeQuizLabel} onClick={handleTakeQuiz} />
        )}
      </div>

      <div>
        <ol className="!m-0 flex list-none flex-col !p-0 !pt-8">
          {module.steps.map((step, index) => (
            <StepItem
              key={step.slug}
              order={String(step.order).padStart(2, "0")}
              title={step.title}
              url={step.url}
              read={readStatuses?.[step.postPath]}
              showConnector={index < module.steps.length - 1}
              nextRead={isRead(index + 1)}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
