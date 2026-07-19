import { StepItem } from "./step-item";
import type { ModuleData } from "./journey-stepper";

interface ModuleSectionProps {
  module: ModuleData;
}

export function ModuleSection({ module }: ModuleSectionProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-heading">
          {module.title}
        </h2>
        <p className="mt-1 max-w-[65ch] text-base text-ink-muted">
          {module.description}
        </p>
      </div>

      <ol className="!m-0 flex flex-col !p-0">
        {module.steps.map((step, index) => (
          <StepItem
            key={step.id}
            index={index + 1}
            title={step.title}
            url={step.url}
          />
        ))}
      </ol>
    </section>
  );
}
