"use client";

import { Fragment } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useReadStatuses } from "@/lib/api";
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
  lang: string;
  listSlug: string;
  modules: ModuleData[];
  moduleLabel: string;
  readLabel: string;
  takeQuizLabel: string;
}

export function JourneyStepper({
  lang,
  listSlug,
  modules,
  moduleLabel,
  readLabel,
  takeQuizLabel,
}: JourneyStepperProps) {
  const { user } = useAuth();
  const allSlugs = modules.flatMap((module) => module.steps.map((step) => step.slug));

  const { data: readStatuses } = useReadStatuses({
    paths: allSlugs,
    enabled: !!user,
  });

  return (
    <div className="flex flex-col">
      {modules.map((module, index) => (
        <Fragment key={module.id}>
          {index > 0 && <hr className="my-14 border-t border-rule" />}
          <ModuleSection
            lang={lang}
            listSlug={listSlug}
            module={module}
            moduleNumber={index + 1}
            moduleLabel={moduleLabel}
            readLabel={readLabel}
            takeQuizLabel={takeQuizLabel}
            readStatuses={user ? readStatuses : undefined}
          />
        </Fragment>
      ))}
    </div>
  );
}
