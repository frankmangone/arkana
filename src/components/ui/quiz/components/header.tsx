import { ChevronDown, ChevronUp } from "lucide-react";

interface QuizHeaderProps {
  isOpen: boolean;
  toggleQuiz: () => void;
}

const styles = {
    button: 'flex flex-row items-center justify-between cursor-pointer text-left w-full z-2',
    line: 'border-2 border-t-0 border-secondary-750 flex-1',
    textContainer: (isOpen: boolean) => `h-14 flex items-center gap-2 px-4 border-2 border-secondary-750 ${isOpen ? 'text-background bg-secondary-750' : 'text-secondary-750 bg-background'}`,
    text: (isOpen: boolean) => `font-semibold text-lg ${isOpen ? 'text-background' : 'text-secondary-750'}`,
    icon: (isOpen: boolean) => `w-6 h-6 shrink-0 ${isOpen ? 'text-background' : 'text-secondary-750'}`,
}

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