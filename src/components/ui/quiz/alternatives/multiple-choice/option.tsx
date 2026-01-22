import { Check, X } from "lucide-react";
import { LatexText } from "../../components/latex-text";
import { QuizOption } from "../../types";

interface MultipleChoiceOptionProps {
  option: QuizOption;
  questionId: string;
  selectedAnswers: string[];
  handleOptionChange: (optionId: string, isChecked: boolean) => void;
  isCorrect: boolean;
  submitted: boolean;
}

const styles = {
  checkbox: {
    outer: (isSelected: boolean): string => `w-4 h-4 border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary-700' : 'border-primary-300'}`,
    inner: (isSelected: boolean): string => `w-1.5 h-1.5 bg-primary-700 ${isSelected ? 'block' : 'hidden'}`,
  },
  baseOption: "flex flex-1 items-center gap-2 p-3 border cursor-pointer transition-colors",
  optionText: 'text-gray-200 mx-4 flex-1',
  selectedOption: (isSelected: boolean, isCorrect: boolean, showFeedback: boolean): string => {
    let optionClass = "border-2";

    if (!showFeedback) {
      optionClass = `${optionClass} border-primary-100 hover:bg-primary-100`;

      if (isSelected) {
        optionClass = `${optionClass} border-primary-100 bg-primary-100`;
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
  iconPadding: 'w-4',
  correct: 'p-0.5 bg-aquamarine',
  incorrect: 'p-0.5 bg-salmon',
  icon: 'w-3 h-3 text-background',
} as const;

export const MultipleChoiceOption: React.FC<MultipleChoiceOptionProps> = (props: MultipleChoiceOptionProps) => {
  const { option, questionId, selectedAnswers, handleOptionChange, submitted } = props;

  const isSelected = selectedAnswers.includes(option.id);
  const isCorrectOption = option.isCorrect;
  const showFeedback = submitted;

  const optionClass = styles.selectedOption(isSelected, isCorrectOption, showFeedback);

  return (
    <label
      key={option.id}
      className={`${styles.baseOption} ${optionClass}`}
    >
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          name={questionId}
          value={option.id}
          checked={isSelected}
          onChange={(e) => handleOptionChange(option.id, e.target.checked)}
          disabled={submitted}
          className="sr-only"
        />
       {!showFeedback && (
        <div className={styles.checkbox.outer(isSelected)}>
          <div className={styles.checkbox.inner(isSelected)} />
        </div>
       )}
       {showFeedback && !isSelected && (
        <div className={styles.iconPadding} />
       )}
       {showFeedback && isCorrectOption && isSelected && (
        <div className={styles.correct}>
          <Check strokeWidth={4} className={styles.icon} />
        </div>
       )}
       {showFeedback && !isCorrectOption && isSelected && (
        <div className={styles.incorrect}>
          <X strokeWidth={4} className={styles.icon} />
        </div>
       )}
      </div>
      <span className={styles.optionText}>
        <LatexText>{option.text}</LatexText>
      </span>
      
    </label>
  );
};
