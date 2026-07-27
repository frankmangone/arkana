import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuestionDifficulty } from "@/features/quiz/types";

/** Color-coded within the house palette: aquamarine → violet → magenta. */
const TIER_CLASSES: Record<QuestionDifficulty, string> = {
  1: "border-aquamarine-450/60 text-aquamarine-600",
  2: "border-primary-700/60 text-primary-800",
  3: "border-secondary-700/60 text-secondary-800",
};

interface DifficultyPillProps {
  difficulty: QuestionDifficulty;
  /** Localized tier label, e.g. "Easy". */
  label: string;
}

export function DifficultyPill({ difficulty, label }: DifficultyPillProps) {
  return (
    <Badge
      variant="outline"
      className={cn("shrink-0", TIER_CLASSES[difficulty])}
    >
      {label}
    </Badge>
  );
}
