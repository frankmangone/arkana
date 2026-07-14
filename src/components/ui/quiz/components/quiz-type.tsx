import { EQuizType, QuizDictionary } from "../types";
import { CircleCheck, Grid2x2Check } from "lucide-react";

interface QuizTypeNoteProps {
  questionType: EQuizType;
  dictionary: QuizDictionary;
}

const styles = {
  quizType:
    "absolute top-14 sm:top-3 left-6 sm:left-auto sm:right-3 rounded-[3px] border border-secondary-750/40 px-2 py-1.5 flex items-center gap-2",
  icon: "w-4 h-4 text-secondary-800",
  quizTypeText:
    "text-secondary-800 font-medium text-[10px] uppercase tracking-[0.12em]",
};

const getQuizTypeIcon = (questionType: EQuizType) => {
  switch (questionType) {
    case EQuizType.Multiple:
      return Grid2x2Check;
    case EQuizType.Single:
    default:
      return CircleCheck;
  }
};
export function QuizTypeNote(props: QuizTypeNoteProps) {
  const { questionType, dictionary } = props;

  const QuizTypeIcon = getQuizTypeIcon(questionType);

  return (
    <div className={styles.quizType}>
      <QuizTypeIcon className={styles.icon} />
      <span className={styles.quizTypeText}>
        {questionType === EQuizType.Multiple
          ? dictionary.multipleChoice
          : dictionary.singleChoice}
      </span>
    </div>
  );
}
