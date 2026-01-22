import { PartyPopper, Frown, Lightbulb } from "lucide-react";
import { LatexText } from "./latex-text";
import { EQuizResult, QuizDictionary } from "../types";

interface QuizResultProps {
    dictionary: QuizDictionary;
    feedback: string;
    result: EQuizResult | null;
}

const styles = {
  container: "p-6 border-t-2 border-dashed border-t-primary-700 bg-background",
  title: "font-semibold mb-1",
  correct: "text-aquamarine-800 flex items-center gap-2",
  partiallyCorrect: "text-bronze-800 flex items-center gap-2",
  incorrect: "text-salmon-800 flex items-center gap-2",
  icon: 'w-5 h-5 mt-[-2px]',
  feedback: "text-sm",
}

export function QuizResult(props: QuizResultProps) {
    const { result, dictionary, feedback } = props

    if (!result) {
        return null;
    }

    return (
      <div className={styles.container}>
        <p className={styles.title}>
          {result === EQuizResult.Correct && (
            <span className={styles.correct}>
              <PartyPopper className={styles.icon} />
              <span>{dictionary.correct}</span>
            </span>
          )}
          {result === EQuizResult.PartiallyCorrect && (
            <span className={styles.partiallyCorrect}>
              <Lightbulb className={styles.icon} />
              <span>{dictionary.almost}</span>
            </span>
          )}
          {result === EQuizResult.Incorrect && (
            <span className={styles.incorrect}>
              <Frown className={styles.icon} />
              <span>{dictionary.incorrect}</span>
            </span>
          )}
        </p>
        <p className={styles.feedback}>
          <LatexText>{feedback}</LatexText>
        </p>
      </div>)
}