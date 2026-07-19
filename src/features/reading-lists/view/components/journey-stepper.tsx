import { ModuleSection } from "./module-section";

export interface StepData {
  id: string;
  slug: string;
  title: string;
  url: string;
}

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  steps: StepData[];
}

interface JourneyStepperProps {
  modules: ModuleData[];
}

export function JourneyStepper({ modules }: JourneyStepperProps) {
  return (
    <div className="flex flex-col gap-14">
      {modules.map((module) => (
        <ModuleSection key={module.id} module={module} />
      ))}
    </div>
  );
}
