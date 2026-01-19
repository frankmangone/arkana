import { HTMLAttributes } from "react";
import QuizComponent from "./quiz";
import { VideoEmbed } from "./video-embed";

interface DivSwitchProps extends HTMLAttributes<HTMLDivElement> {
  "data-src"?: string;
  "data-lang"?: string;
  quizDictionary?: {
    submitAnswer: string;
    correct: string;
    almost: string;
    incorrect: string;
    multipleChoice: string;
    singleChoice: string;
  };
}

/**
 * Div - A selection layer for special div types
 * Handles quiz-embed and video-embed  divs, and falls back to default div rendering
 * @param className - The class name of the div
 * @param dataSrc - The data-src attribute of the div
 * @param dataLang - The data-lang attribute of the div
 * @param quizDictionary - The quiz dictionary
 * @param props - The props of the div
 * @returns The div component
 */
export function DivSwitch({
  className,
  "data-src": dataSrc,
  "data-lang": dataLang,
  quizDictionary,
  ...props
}: DivSwitchProps) {
  // Handle quiz-embed divs
  if (className?.includes("quiz-embed")) {
    if (!dataSrc) return null;
    return (
      <QuizComponent
        src={dataSrc}
        lang={dataLang || "en"}
        dictionary={quizDictionary}
      />
    );
  }

  // Handle video-embed divs
  if (className?.includes("video-embed")) {
    return <VideoEmbed src={dataSrc || undefined} />;
  }

  // Default div handling
  return <div className={className} {...props} />;
}
