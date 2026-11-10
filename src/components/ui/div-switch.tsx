import { HTMLAttributes } from "react";
import QuizComponent from "./quiz";
import { VideoEmbed } from "./video-embed";
import { EmbedFrame } from "./embed/embed-frame";
import { QuizDictionary } from "./quiz/types";

interface DivSwitchProps extends HTMLAttributes<HTMLDivElement> {
  "data-src"?: string;
  "data-lang"?: string;
  "data-title"?: string;
  "data-height"?: string;
  quizDictionary?: QuizDictionary;
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
  "data-title": dataTitle,
  "data-height": dataHeight,
  quizDictionary,
  ...props
}: DivSwitchProps) {
  // Handle quiz-embed divs
  if (className?.includes("quiz-embed")) {
    if (!dataSrc) return null;
    if (!quizDictionary) {
      console.warn("Quiz dictionary not provided to quiz-embed");
      return null;
    }
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

  // Handle embed-frame divs (sandboxed interactive embeds)
  if (className?.includes("embed-frame")) {
    return <EmbedFrame src={dataSrc} title={dataTitle} height={dataHeight} />;
  }

  // Default div handling
  return <div className={className} {...props} />;
}
