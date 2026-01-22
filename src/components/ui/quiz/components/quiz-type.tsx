import { EQuizType, QuizDictionary } from "../types";
import { CircleCheck, Grid2x2Check } from "lucide-react";

interface QuizTypeNoteProps {
    questionType: EQuizType;
    dictionary: QuizDictionary;
}

const styles = {
    quizType: 'absolute top-2 right-2 bg-secondary-300 p-2 flex items-center gap-2',
    icon: 'w-4 h-4 text-secondary-900',
    quizTypeText: 'text-secondary-900 font-medium text-sm',
}

const getQuizTypeIcon = (questionType: EQuizType) => {
    switch (questionType) {
        case EQuizType.Multiple:
            return Grid2x2Check;
        case EQuizType.Single:
        default:
            return CircleCheck;
    }
}
export function QuizTypeNote(props: QuizTypeNoteProps) {
    const { questionType, dictionary } = props;

    const QuizTypeIcon = getQuizTypeIcon(questionType);

    return (
        <div className={styles.quizType}>
            <QuizTypeIcon className={styles.icon} />
            <span className={styles.quizTypeText}>{questionType === EQuizType.Multiple
                ? dictionary.multipleChoice
                : dictionary.singleChoice}</span>
        </div>
    );
}
