import { LatexText } from "@/components/ui/latex-text";
import { QuizOption } from "../../types";

interface SingleChoiceOptionProps {
  option: QuizOption;
  questionId: string;
  selectedAnswer: string;
  setSelectedAnswer: (answer: string) => void;
  isCorrect: boolean;
  submitted: boolean;
}

const styles = {
  baseOption:
    "flex flex-1 items-center gap-2 p-3 rounded-[4px] border cursor-pointer transition-colors",
  selectedOption: (
    isSelected: boolean,
    isCorrect: boolean,
    showFeedback: boolean
  ): string => {
    let optionClass = "border-1";

    if (!showFeedback) {
      optionClass = `${optionClass} border-rule hover:border-rule-strong hover:bg-white/[0.03]`;

      if (isSelected) {
        optionClass = `${optionClass} border-primary-700 bg-primary-700/10`;
      }
    } else {
      if (isSelected && isCorrect) {
        optionClass = `${optionClass} border-aquamarine bg-aquamarine-50`;
      } else if (isSelected) {
        optionClass = `${optionClass} border-salmon bg-salmon-50`;
      } else if (isCorrect) {
        optionClass = `${optionClass} border-aquamarine-100 bg-aquamarine-100`;
      }
    }

    return optionClass;
  },
} as const;

export const SingleChoiceOption: React.FC<SingleChoiceOptionProps> = (
  props: SingleChoiceOptionProps
) => {
  const { option, questionId, selectedAnswer, setSelectedAnswer, submitted } =
    props;

  const isSelected = selectedAnswer === option.id;
  const isCorrectOption = option.isCorrect;
  const showFeedback = submitted;

  const optionClass = styles.selectedOption(
    isSelected,
    isCorrectOption,
    showFeedback
  );

  return (
    <label key={option.id} className={`${styles.baseOption} ${optionClass}`}>
      <div className="relative flex-shrink-0">
        <input
          type="radio"
          name={questionId}
          value={option.id}
          checked={isSelected}
          onChange={(e) => setSelectedAnswer(e.target.value)}
          disabled={submitted}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 border-2 flex items-center justify-center transition-all ${isSelected ? "border-primary-700" : "border-rule-strong"}`}
        >
          {isSelected && <div className="w-1.5 h-1.5 bg-primary-700" />}
        </div>
      </div>
      <span className="text-ink-body ml-4">
        <LatexText inline>{option.text}</LatexText>
      </span>
    </label>
  );
};
