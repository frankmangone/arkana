export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionContent {
  question: string;
  options: QuizOption[];
  feedback: string;
}

export interface QuizQuestion {
  id: string;
  type: "single" | "multiple";
  [lang: string]: QuizQuestionContent | string;
}

export interface QuizDictionary {
  submitAnswer: string;
  correct: string;
  almost: string;
  incorrect: string;
  multipleChoice: string;
  singleChoice: string;
}

export interface QuizBodyProps {
  questionId: string;
  questionContent: QuizQuestionContent;
  dictionary: QuizDictionary;
}

