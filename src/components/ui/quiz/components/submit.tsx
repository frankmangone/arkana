import { Button } from "@/components/ui/button";
import { QuizDictionary } from "../types";

interface SubmitProps {
  submitted: boolean;
  handleSubmit: () => void;
  disabled: boolean;
  dictionary: QuizDictionary;
}

export const Submit: React.FC<SubmitProps> = ({
  submitted,
  handleSubmit,
  disabled,
  dictionary,
}) => {
  if (submitted) {
    return null;
  }

  return (
    <Button
      onClick={handleSubmit}
      disabled={disabled}
      className="px-6 py-3 self-end rounded-[4px] bg-secondary-700 hover:bg-secondary-750 cursor-pointer disabled:bg-surface-overlay disabled:text-ink-faint disabled:cursor-not-allowed text-[#1d0a2e] font-medium text-md transition-colors"
    >
      {dictionary.submitAnswer}
    </Button>
  );
};
