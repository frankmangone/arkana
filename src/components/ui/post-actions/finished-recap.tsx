import { KeyConceptsTrigger } from "@/components/ui/key-concepts-modal";
import { CompletionMark } from "./completion-animation";

interface FinishedRecapProps {
  /** The "Article finished!" text. */
  label: string;
  /** The label of the button that opens the key concepts. */
  recapLabel: string;
  /** Whether the reader has reached the end: the mark only shows then. */
  completed: boolean;
}

const Rule = ({ className }: { className?: string }) => (
  <span
    className={`h-px w-full max-w-24 bg-rule ${className ?? ""}`}
    aria-hidden="true"
  />
);

/**
 * The end of an article that has key concepts: the "Article finished!" mark
 * and the button that offers the key concepts, as one divider, flanked by the
 * same hairline rules as the plain one. On a wide screen it's all one line,
 * with a thin vertical rule between the mark and the button; on a narrow one
 * the rules stay around the mark and the button goes below it.
 */
export function FinishedRecap({
  label,
  recapLabel,
  completed,
}: FinishedRecapProps) {
  return (
    <div className="my-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      {/* On a wide screen this wrapper dissolves, so the mark, the button and
          the rules all sit in the one row. */}
      <div className="flex w-full items-center justify-center gap-4 sm:contents">
        <Rule />
        {completed ? (
          <div role="status">
            <CompletionMark label={label} />
          </div>
        ) : (
          // An invisible copy of the mark, so the button doesn't shift sideways
          // when the real one appears.
          <div aria-hidden className="invisible">
            <CompletionMark label={label} />
          </div>
        )}
        {/* The closing rule of the narrow layout; the wide one has it after the button. */}
        <Rule className="sm:hidden" />
      </div>
      {/* Sets the button apart from the mark; only the one-line layout has it. */}
      <span className="hidden h-9 w-px bg-rule sm:block" aria-hidden="true" />
      <KeyConceptsTrigger label={recapLabel} variant="recap" />
      <Rule className="hidden sm:block" />
    </div>
  );
}
