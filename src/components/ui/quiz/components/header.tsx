import { ChevronDown, ChevronUp } from "lucide-react";

interface QuizHeaderProps {
  isOpen: boolean;
  toggleQuiz: () => void;
}

const styles = {
  button:
    "flex flex-row items-center justify-between cursor-pointer text-left w-full z-2",
  line: "h-px bg-rule flex-1",
  textContainer: (isOpen: boolean) =>
    `h-12 flex items-center gap-2 px-5 rounded-[4px] border transition-colors ${isOpen ? "border-secondary-750 bg-secondary-750" : "border-rule-strong bg-transparent hover:border-secondary-750"}`,
  text: (isOpen: boolean) =>
    `font-semibold text-base tracking-wide ${isOpen ? "text-[#1d0a2e]" : "text-secondary-750"}`,
  icon: (isOpen: boolean) =>
    `w-5 h-5 shrink-0 ${isOpen ? "text-[#1d0a2e]" : "text-secondary-750"}`,
};

export function QuizHeader(props: QuizHeaderProps) {
  const { isOpen, toggleQuiz } = props;

  return (
    <button
      onClick={toggleQuiz}
      className={styles.button}
      type="button"
      aria-expanded={isOpen}
      aria-label={isOpen ? "Collapse quiz" : "Expand quiz"}
    >
      <div className={styles.line} />

      <div className={styles.textContainer(isOpen)}>
        <span className={styles.text(isOpen)}>Quiz</span>
        {isOpen ? (
          <ChevronUp className={styles.icon(isOpen)} />
        ) : (
          <ChevronDown className={styles.icon(isOpen)} />
        )}
      </div>

      <div className={styles.line} />
    </button>
  );
}
