import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuestionDifficulty } from "@/features/quiz/types";

interface DifficultyPillProps {
  difficulty: QuestionDifficulty;
  /** Localized tier label, e.g. "Easy". */
  label: string;
  className?: string;
}

const styles = {
  // Soft halo in the same fill color, pushing the mosaic pattern behind
  // it out of the way so the chip doesn't read as embedded in the pattern.
  badge: (className?: string) => cn(
    "border-primary-700/60 bg-surface-overlay text-primary-700 shadow-[0_0_14px_6px_var(--background)]",
    className
  ),
};

export function DifficultyPill({
  difficulty,
  label,
  className,
}: DifficultyPillProps) {
  return (
    <Badge
      className={styles.badge(className)}
      // Tier still drives the label text - just no longer a distinct color
      // per tier, so the pill reads as one consistent "difficulty" chip.
      data-difficulty={difficulty}
    >
      {label}
    </Badge>
  );
}
