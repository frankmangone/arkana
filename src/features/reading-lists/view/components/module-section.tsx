import { CheckCircle2, Clock } from "lucide-react";
import { StepItem } from "./step-item";
import type { ModuleData } from "./journey-stepper";

interface ModuleSectionProps {
  module: ModuleData;
  moduleNumber: number;
  moduleLabel: string;
  readLabel: string;
  /** Per-slug read status for the logged-in user. Undefined for guests — no progress shown. */
  readStatuses?: Record<string, boolean>;
}

export function ModuleSection(props: ModuleSectionProps) {
  const { module, moduleNumber, moduleLabel, readLabel, readStatuses } = props;

  const readCount = readStatuses
    ? module.steps.filter((step) => readStatuses[step.slug]).length
    : undefined;

  return (
    <section className="grid gap-8 md:grid-cols-[2fr_3fr] md:gap-x-12">
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
            <span className="inline-flex items-center text-xs text-ink-faint">
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
      </div>

      <ol className="!m-0 flex list-none flex-col !p-0 !pt-8">
        {module.steps.map((step, index) => (
          <StepItem
            key={step.id}
            order={String(step.order).padStart(2, "0")}
            title={step.title}
            url={step.url}
            read={readStatuses?.[step.slug]}
            showConnector={index < module.steps.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}
