import { useState } from "react";
import { MultipleChoiceQuiz } from "../alternatives/multiple-choice";
import { SingleChoiceQuiz } from "../alternatives/single-choice";
import { QuizDictionary, QuizQuestionContent, EQuizType, EQuizResult } from "../types";
import { LatexText } from "./latex-text"
import { QuizTypeNote } from "./quiz-type";
import { QuizResult } from "./result";

interface QuizContentProps {
    isOpen: boolean;
    questionId: string;
    questionType: EQuizType;
    questionContent: QuizQuestionContent;
    dictionary: QuizDictionary;
}

const styles = {
    container: 'relative -mt-7 z-[1] w-full overflow-visible',
    borderWrapper: 'mt-[-1] p-[2px] bg-gradient-to-b from-secondary-700 to-primary-700',
    content: 'relative bg-background p-6 pt-22 overflow-visible',
    quizType: 'absolute top-0 right-0 bg-primary-700 p-2',
    quizTypeText: 'text-background text-md',
    title: "font-semibold text-xl mt-4 sm:mt-0 mb-4 flex",
}

const getQuizComponent = (questionType: EQuizType) => {
    switch (questionType) {
        case EQuizType.Multiple:
            return MultipleChoiceQuiz;
        case EQuizType.Single:
        default:
            return SingleChoiceQuiz;
    }
}

export const QuizContent = (props: QuizContentProps) => {
    const { isOpen, questionId, questionType, questionContent, dictionary } = props;

    const [result, setResult] = useState<EQuizResult | null>(null);

    const QuizComponent = getQuizComponent(questionType);

    return (
        <div className={`${styles.container} ${isOpen ? 'block' : 'hidden'}`}>
          <div className={styles.borderWrapper} style={{ borderTop: 'none' }}>
            <div className={styles.content}>
              <QuizTypeNote questionType={questionType} dictionary={dictionary} />
              <h4 className={styles.title}>
                <LatexText>{questionContent.question}</LatexText>
              </h4>
              <QuizComponent
                questionId={questionId}
                questionContent={questionContent}
                setResult={setResult}
                dictionary={dictionary}
              />
            </div>
            <QuizResult result={result} dictionary={dictionary} feedback={questionContent.feedback} />
          </div>
      </div>
    );
}