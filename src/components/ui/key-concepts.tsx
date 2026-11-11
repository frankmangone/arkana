"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";
import { ARKANA_PURPLE, KeySigils } from "./key-sigils";
import { ProgressMarkers } from "./progress-markers";

export type KeyConceptsDictionary = {
  title: string;
  previous: string;
  next: string;
  goTo: string; // contains "{n}"
  position: string; // contains "{current}" and "{total}"
};

interface KeyConceptsProps {
  title?: string;
  cards: ReactNode[];
  dictionary: KeyConceptsDictionary;
}

const SWIPE_DISTANCE = 56; // px dragged before a release counts as a swipe
const SWIPE_VELOCITY = 450; // px/s: a quick flick counts too

// Card size and spacing, as fractions of the carousel's width. The cards are
// narrower than the carousel so the neighbours peek in at the sides. On a wide
// screen they fade out towards the edges; on a small one the carousel spans the
// screen, so the cards are wider (the text has room) and there's no fade.
const CARD_WIDTH = 0.8;
const CARD_WIDTH_NARROW = 0.9;
const NARROW_BELOW = 480; // px
const GAP = 0.03;

// Fades the carousel out towards both edges, so the neighbouring cards melt
// away instead of being cut off by a hard edge. Not used on a small screen,
// where the card fills the width and there's nothing to fade.
const EDGE_FADE =
  "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)";

const mod = (n: number, total: number) => ((n % total) + total) % total;

// The track's x offset that centres card `i` in a carousel `width` px wide.
const positionFor = (width: number, cardWidth: number, i: number) =>
  width * ((1 - cardWidth) / 2 - i * (cardWidth + GAP));

const transitionFor = (reduceMotion: boolean | null) =>
  reduceMotion
    ? { duration: 0.1 }
    : { type: "spring" as const, stiffness: 320, damping: 34 };

/**
 * A deck of "key concept" cards, as a carousel: the current card is centred
 * with its neighbours fading out at either side. Drag or swipe it, click a
 * neighbour, use the arrows or dots, or press the arrow keys when the deck has
 * focus. It loops endlessly: after the last card comes the first, sliding on
 * in the same direction.
 *
 * That's done with three identical copies of the deck in a row, starting on
 * the middle one. Moving past either end just slides on into the next copy,
 * and once the track settles there, it jumps back to the same card in the
 * middle copy, which nobody can tell apart.
 */
export function KeyConcepts({ title, cards, dictionary }: KeyConceptsProps) {
  const total = cards.length;
  // With a single card there's nothing to loop through, so no copies.
  const copies = total > 1 ? 3 : 1;
  // Where the carousel is in the row of copies; the middle copy to begin with.
  const [slot, setSlot] = useState(total > 1 ? total : 0);
  const [width, setWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduceMotion = useReducedMotion();

  // Which card of the deck that is.
  const index = total > 0 ? mod(slot, total) : 0;
  const narrow = width < NARROW_BELOW;
  const cardWidth = narrow ? CARD_WIDTH_NARROW : CARD_WIDTH;

  // Track the carousel's width.
  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // When the width is first known, or changes, place the track without animating.
  const slotRef = useRef(slot);
  slotRef.current = slot;
  useLayoutEffect(() => {
    if (width) x.set(positionFor(width, cardWidth, slotRef.current));
  }, [width, cardWidth, x]);

  // When the card changes, slide the track to it.
  const previousSlot = useRef(slot);
  useEffect(() => {
    if (previousSlot.current === slot) return;
    previousSlot.current = slot;
    if (!width) return;
    animate(x, positionFor(width, cardWidth, slot), {
      ...transitionFor(reduceMotion),
      onComplete: () => {
        // Settled on an outer copy: jump to the same card in the middle one.
        const shift = slot < total ? total : slot >= 2 * total ? -total : 0;
        if (shift === 0) return;
        previousSlot.current = slot + shift;
        x.set(positionFor(width, cardWidth, slot + shift));
        setSlot(slot + shift);
      },
    });
  }, [slot, width, cardWidth, x, reduceMotion, total]);

  if (total === 0) return null;

  // Moves by `delta` cards, never past the ends of the row of copies.
  const move = (delta: number) => {
    const target = slot + delta;
    if (target >= 0 && target < copies * total) setSlot(target);
  };
  const next = () => move(1);
  const previous = () => move(-1);
  // Goes to a card of the deck, the shorter way round.
  const goTo = (target: number) => {
    const delta = mod(target - index, total);
    move(delta > total / 2 ? delta - total : delta);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // Let arrow keys inside nested controls (e.g. the dot buttons) behave normally.
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    }
  };

  const position = dictionary.position
    .replace("{current}", String(index + 1))
    .replace("{total}", String(total));
  const heading = title ?? dictionary.title;
  // The gutter either side of the current card, as a share of the carousel's
  // width. The arrows are inset by it, so they line up with the card's edges.
  const edgeInset = `${((1 - cardWidth) / 2) * 100}%`;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={heading}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="not-prose min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-8 focus-visible:ring-offset-surface-page"
    >
      <header className="mb-8 flex flex-col items-center gap-5 text-center">
        {/* Two sigils side by side, shaped like a key. */}
        <KeySigils className="h-12 w-24" />
        <p className="text-lg font-semibold uppercase tracking-[0.22em] text-white sm:text-xl">
          {heading}
        </p>
      </header>

      <div
        ref={viewportRef}
        className="overflow-hidden"
        style={
          narrow
            ? undefined
            : { maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }
        }
      >
        <motion.div
          style={{ x }}
          drag={total > 1 ? "x" : false}
          dragMomentum={false}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (
              info.offset.x < -SWIPE_DISTANCE ||
              info.velocity.x < -SWIPE_VELOCITY
            ) {
              next();
            } else if (
              info.offset.x > SWIPE_DISTANCE ||
              info.velocity.x > SWIPE_VELOCITY
            ) {
              previous();
            } else {
              // Not far enough: settle back on the current card.
              animate(
                x,
                positionFor(width, cardWidth, slot),
                transitionFor(reduceMotion)
              );
            }
          }}
          className="flex w-full touch-pan-y select-none"
        >
          {Array.from({ length: copies * total }, (_, s) => (
            <DeckCard
              key={s}
              active={s === slot}
              position={mod(s, total) + 1}
              total={total}
              widthPercent={cardWidth * 100}
              gapPercent={GAP * 100}
              // Clicking the current card moves on; a neighbour comes forward.
              onSelect={() => (s === slot ? next() : move(s - slot))}
            >
              {cards[mod(s, total)]}
            </DeckCard>
          ))}
        </motion.div>
      </div>

      {total > 1 && (
        <footer className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3">
          <ArrowButton
            label={dictionary.previous}
            onClick={previous}
            style={{ marginLeft: edgeInset }}
          >
            <ArrowGlyph direction="left" />
          </ArrowButton>
          <ProgressMarkers
            total={total}
            index={index}
            onSelect={goTo}
            label={dictionary.goTo}
            className="justify-self-center"
          />
          <ArrowButton
            label={dictionary.next}
            onClick={next}
            style={{ marginRight: edgeInset }}
          >
            <ArrowGlyph direction="right" />
          </ArrowButton>
          <span
            className="col-span-3 justify-self-center text-sm tabular-nums text-ink-muted"
            aria-live="polite"
          >
            <span aria-hidden>
              {index + 1} / {total}
            </span>
            <span className="sr-only">{position}</span>
          </span>
        </footer>
      )}
    </section>
  );
}

interface DeckCardProps {
  children: ReactNode;
  active: boolean;
  position: number;
  total: number;
  widthPercent: number;
  gapPercent: number;
  onSelect: () => void;
}

function DeckCard({
  children,
  active,
  position,
  total,
  widthPercent,
  gapPercent,
  onSelect,
}: DeckCardProps) {
  return (
    <motion.div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} / ${total}`}
      // The copies of the deck would otherwise be read out three times over.
      aria-hidden={active ? undefined : true}
      data-front={active}
      style={{ width: `${widthPercent}%`, marginRight: `${gapPercent}%` }}
      // onTap only fires for a press that wasn't a drag, so swiping never also
      // counts as a click.
      onTap={(event) => {
        if (total < 2) return;
        const target = event.target as HTMLElement | null;
        if (target?.closest("a, button")) return;
        onSelect();
      }}
      className={cn("flex flex-none", total > 1 && "cursor-pointer")}
    >
      <div
        className="w-full rounded-[3px] border p-7 sm:p-10 bg-[color-mix(in_srgb,var(--primary-600)_8%,var(--surface-page))]"
        style={{ borderColor: ARKANA_PURPLE }}
      >
        {/* Only the card in view is readable and focusable; the neighbours are
            a fading preview. (Inert is on the content, not the card, so a
            neighbour can still be clicked to bring it forward.) */}
        <div aria-hidden={!active} inert={!active}>
          <ConceptBody>{children}</ConceptBody>
        </div>
      </div>
    </motion.div>
  );
}

// Card content: the first heading becomes the concept's name, set apart from
// the body by a faint rule. Equations are scaled down from the article's size
// (the site gives display math 1.4rem and 3rem margins, too big for a card).
// The `!` matters: KaTeX's stylesheet and the site's .katex-display rule are
// outside any CSS layer, so they'd otherwise beat these layered utilities.
function ConceptBody({ children }: { children: ReactNode }) {
  return (
    <div className="[&_h4]:mb-5 [&_h4]:mt-0 [&_h4]:border-b [&_h4]:border-rule [&_h4]:pb-4 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-ink-heading sm:[&_h4]:text-2xl [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&>*:last-child]:mb-0 [&_.katex]:text-[1.05em]! [&_.katex-display]:my-5! [&_.katex-display]:text-[1rem]!">
      {children}
    </div>
  );
}

/** An arrow built from the sigils' vocabulary: a straight line and 45° strokes. */
function ArrowGlyph({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <path d="M14 8H3M7 4L3 8L7 12" />
      ) : (
        <path d="M2 8H13M9 4L13 8L9 12" />
      )}
    </svg>
  );
}

function ArrowButton({
  label,
  onClick,
  style,
  children,
}: {
  label: string;
  onClick: () => void;
  style?: CSSProperties;
  children: ReactNode;
}) {
  // A ghost button: no outline, just a soft highlight on hover.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={style}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[3px] text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {children}
    </button>
  );
}
