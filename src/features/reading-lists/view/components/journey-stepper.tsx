import { Fragment } from "react";
import { ModuleSection } from "./module-section";

export interface StepData {
  id: string;
  slug: string;
  title: string;
  url: string;
  /** Position across the whole journey, not just within this module. */
  order: number;
}

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  readingTime: string;
  steps: StepData[];
}

interface JourneyStepperProps {
  modules: ModuleData[];
  moduleLabel: string;
}

export function JourneyStepper({ modules, moduleLabel }: JourneyStepperProps) {
  return (
    <div className="flex flex-col">
      {modules.map((module, index) => (
        <Fragment key={module.id}>
          {index > 0 && <hr className="my-14 border-t border-rule" />}
          <ModuleSection
            module={module}
            moduleNumber={index + 1}
            moduleLabel={moduleLabel}
          />
        </Fragment>
      ))}
    </div>
  );
}
