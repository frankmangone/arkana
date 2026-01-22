import { Button } from "@/components/ui/button";
import { QuizDictionary } from "../types";

interface SubmitProps {
  submitted: boolean;
  handleSubmit: () => void;
  disabled: boolean;
  dictionary: QuizDictionary;
}

export const Submit: React.FC<SubmitProps> = ({ submitted, handleSubmit, disabled, dictionary }) => {
    if (submitted) {
        return null;
    }

  return (
    <Button
      onClick={handleSubmit}
      disabled={disabled}
      className="px-4 py-6 self-end bg-secondary-700 hover:bg-secondary-800 cursor-pointer disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-md transition-colors"
    >
      {dictionary.submitAnswer}
    </Button>
  );
}