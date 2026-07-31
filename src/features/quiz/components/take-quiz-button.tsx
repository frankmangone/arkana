"use client";

import { useState } from "react";
import { GlyphRail } from "@/features/quiz/components/glyph-rail";
import { cn } from "@/lib/utils";

const styles = {
  // The quiz visual identity in entry-point form: the question card's glyph
  // lattice as the button's backdrop. Idle it sits as dim as the card band;
  // hover/focus "lights it up" — border and lattice brighten together in the
  // primary lane.
  button: cn(
    // flex (not inline-flex) so mx-auto can center the fit-width button.
    "group relative flex w-fit cursor-pointer overflow-hidden rounded-md border border-rule bg-surface-raised",
    "transition-[border-color,box-shadow,transform] duration-300 ease-out",
    "hover:border-primary-600 focus-visible:border-primary-600 outline-none",
    // Same soft-glow formula as the graded question card, in the primary lane.
    "hover:shadow-[0_4px_40px_-8px_hsla(260,80%,60%,0.4)]",
    "focus-visible:shadow-[0_4px_40px_-8px_hsla(260,80%,60%,0.4)]"
  ),
  // Repositioned from the card-band defaults: fill the button instead of
  // sitting as a strip above the content (mt-0 cancels the band's -mt-6
  // card-padding offset).
  rail: cn(
    "absolute inset-0 mt-0 h-full",
    "group-hover:text-primary-600 group-hover:opacity-70",
    "group-focus-visible:text-primary-600 group-focus-visible:opacity-70"
  ),
  label:
    "relative z-10 flex items-center justify-center px-10 py-4 text-sm font-medium text-ink-heading",
};

interface TakeQuizButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

/** Entry point into a module's quiz — see the reading-list module section. */
export function TakeQuizButton({ label, onClick, className }: TakeQuizButtonProps) {
  // Bumped on every hover/focus entry — each one replays the lattice's
  // decode scramble as a flourish (it re-locks into the idle glyphs).
  const [pulse, setPulse] = useState(0);
  const replayScramble = () => setPulse((count) => count + 1);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={replayScramble}
      onFocus={replayScramble}
      className={cn(styles.button, className)}
    >
      <GlyphRail status="idle" layout="band" pulse={pulse} className={styles.rail} />
      <span className={styles.label}>{label}</span>
    </button>
  );
}
