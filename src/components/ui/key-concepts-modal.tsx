"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Coffee, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, badgeVariants } from "./badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog";

// The modal lives in the post's hero, but its triggers are spread around the
// page (the hero's actions row, the start of the article body), which don't
// share a client ancestor. So the modal registers how to open it here, and
// triggers call it. There's only ever one modal per page.
let openModal: ((opener: HTMLElement) => void) | null = null;

interface KeyConceptsModalProps {
  label: string;
  /** Text (translated) of the button that closes the modal. */
  closeLabel: string;
  /** The rendered <KeyConcepts> deck, shown inside the modal. */
  deck: ReactNode;
}

/**
 * The one modal for a post's key-concepts deck, opened by any number of
 * <KeyConceptsTrigger>s. Sharing a single dialog means the deck is only sent
 * to the browser once, however many buttons open it.
 */
export function KeyConceptsModal({
  label,
  closeLabel,
  deck,
}: KeyConceptsModalProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    openModal = (opener) => {
      openerRef.current = opener;
      setOpen(true);
    };
    return () => {
      openModal = null;
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        ref={contentRef}
        // No panel: the cards themselves are the modal, floating over a dimmed
        // and blurred page.
        overlayClassName="bg-black/70 backdrop-blur-sm"
        showCloseButton={false}
        // Land focus on the deck itself so the arrow keys work straight away.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          contentRef.current
            ?.querySelector<HTMLElement>('[aria-roledescription="carousel"]')
            ?.focus();
        }}
        // Hand focus back to whichever button opened it.
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          openerRef.current?.focus();
        }}
        // The dialog is a grid, whose single column otherwise refuses to shrink
        // below its content's minimum width. The cards add up to more than a
        // phone screen, which pushed everything off-centre. minmax(0, 1fr)
        // pins the column to the dialog's width.
        // On a phone it spans the whole screen, with no gutter, so the cards
        // slide in from the screen's edge instead of being cut short of it.
        className="max-w-full grid-cols-[minmax(0,1fr)] border-0 bg-transparent p-0 shadow-none sm:max-w-2xl"
      >
        {/* The deck has its own visible heading; these are for screen readers. */}
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <DialogDescription className="sr-only">{label}</DialogDescription>
        {/* The backdrop is always dark, so the deck always uses the dark
            palette, whatever the page's theme. */}
        <div className="dark min-w-0 text-ink-body">{deck}</div>
        {/* An outline button, like the one that opened the modal, centred
            below the deck. */}
        <DialogClose
          className={cn(
            badgeVariants(),
            "mx-auto mt-4 cursor-pointer border-white/40 px-6 py-2.5 text-xs text-white hover:border-white hover:bg-white/10"
          )}
        >
          {closeLabel}
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

interface KeyConceptsTriggerProps {
  label: string;
  /**
   * "tldr": the joke button at the top of an article (a coffee).
   * "recap": the plain "Key concepts" button at the end (a stack).
   * A string rather than an icon, because this is rendered from a server
   * component, and components can't be passed across to client ones.
   */
  variant?: "tldr" | "recap";
  className?: string;
}

/**
 * The outline badge button that opens the key-concepts modal. It follows the
 * page theme and is styled like the site's tags.
 */
export function KeyConceptsTrigger({
  label,
  variant = "tldr",
  className,
}: KeyConceptsTriggerProps) {
  const Icon = variant === "recap" ? Layers : Coffee;
  return (
    // On Badge itself (not the <button>), so cn() merges these over the
    // defaults instead of both sets of classes applying.
    <Badge
      asChild
      className={cn(
        "cursor-pointer gap-2 border-ink-faint px-4 py-2.5 text-xs text-ink-body hover:border-primary-700 hover:text-primary-800 [&>svg]:size-4",
        // At the end of the article it's a question, and reads better as a
        // sentence than shouted in capitals.
        variant === "recap" && "text-sm normal-case tracking-normal",
        className
      )}
    >
      <button
        type="button"
        onClick={(event) => openModal?.(event.currentTarget)}
      >
        <Icon aria-hidden />
        {label}
      </button>
    </Badge>
  );
}
