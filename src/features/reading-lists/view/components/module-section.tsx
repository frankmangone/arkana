import { StepItem } from "./step-item";
import type { ModuleData } from "./journey-stepper";

interface ModuleSectionProps {
  module: ModuleData;
  moduleNumber: number;
  moduleLabel: string;
}

export function ModuleSection(props: ModuleSectionProps) {
  const { module, moduleNumber, moduleLabel } = props;

  return (
    <section className="grid gap-8 md:grid-cols-[2fr_3fr] md:gap-x-12">
      <div>
        <span className="eyebrow text-ink-faint">
          {moduleLabel} {String(moduleNumber).padStart(2, "0")}
        </span>
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
            showConnector={index < module.steps.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}
