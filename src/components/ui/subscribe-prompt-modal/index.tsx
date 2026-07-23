"use client";

import { useMemo } from "react";
import { Mail } from "lucide-react";
import { useComponent } from "./use-component";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArkanaPattern from "@/components/arkana-pattern";
import type { Pattern } from "@/components/arkana-strip";

// bg-none cancels the default variant's --grad-brand background-image —
// otherwise the gradient paints over any background-color we set here.
const SUBSCRIBE_BUTTON_CLASSNAME = "bg-none bg-primary-500 hover:bg-primary-600";

const GLYPH_ROW_COUNT = 3;
const GLYPH_SIZE = 48;
// primary-700 (see globals.css) — canvas color isn't resolved through the
// CSS cascade, so var() won't work here; this must track that token by hand.
const GLYPH_COLOR = "hsl(260, 80%, 68%)";

type ArkanaElements = Pattern["elements"];

// Same bit layout/randomization as decoder-sigil.tsx's randomElements().
function randomElements(): ArkanaElements {
  let bits = "";
  for (let i = 0; i < 16; i++) {
    bits += Math.random() > 0.5 ? "1" : "0";
  }
  return {
    left: true,
    right: true,

    top: bits[0] === "1",
    bottom: bits[1] === "1",

    top_left_ray: bits[2] === "1",
    top_right_ray: bits[3] === "1",
    bottom_left_ray: bits[4] === "1",
    bottom_right_ray: bits[5] === "1",

    top_left_left_side: bits[6] === "1",
    top_top_left_side: bits[7] === "1",
    top_top_right_side: bits[8] === "1",
    top_right_right_side: bits[9] === "1",
    bottom_right_right_side: bits[10] === "1",
    bottom_bottom_right_side: bits[11] === "1",
    bottom_bottom_left_side: bits[12] === "1",
    bottom_left_left_side: bits[13] === "1",

    central_diagonal_1: bits[14] === "1",
    central_diagonal_2: bits[15] === "1",
  };
}

export function SubscribePromptModal() {
  const {
    dictionary,
    open,
    setOpen,
    view,
    email,
    setEmail,
    isLoggedIn,
    isGuestSubmitting,
    isAuthenticatedSubmitting,
    handleGuestSubmit,
    handleAuthenticatedSubscribe,
  } = useComponent();

  // Fixed for the life of the modal — regenerating on every re-render would
  // make the row flicker while the guest email input is being typed into.
  const glyphs = useMemo(
    () => Array.from({ length: GLYPH_ROW_COUNT }, randomElements),
    []
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-11">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-100/40 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex flex-row justify-center gap-3" aria-hidden="true">
            {glyphs.map((elements, i) => (
              <ArkanaPattern
                key={i}
                elements={elements}
                canvasSize={GLYPH_SIZE}
                lineColor={GLYPH_COLOR}
                backgroundColor="transparent"
              />
            ))}
          </div>

          {view === "checkEmail" ? (
            <DialogHeader className="sm:text-center">
              <DialogTitle className="text-2xl text-ink-heading">
                {dictionary?.subscribe.modal.checkEmailTitle ||
                  "Check your email"}
              </DialogTitle>
              <DialogDescription className="text-ink-body">
                {dictionary?.subscribe.modal.checkEmailDescription ||
                  "We've sent a confirmation link to your inbox."}
              </DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader className="sm:text-center">
                <DialogTitle className="text-2xl text-ink-heading">
                  {dictionary?.subscribe.modal.title || "Never miss a post"}
                </DialogTitle>
                <DialogDescription className="text-ink-body">
                  {dictionary?.subscribe.modal.description ||
                    "Subscribe to our newsletter to get an email every time we publish something new!"}
                </DialogDescription>
              </DialogHeader>

              {isLoggedIn ? (
                <div className="w-full space-y-4">
                  <Input
                    type="email"
                    value={email}
                    placeholder={
                      dictionary?.subscribe.modal.emailPlaceholder ||
                      "you@example.com"
                    }
                    disabled
                    className="bg-white/10"
                  />
                  <DialogFooter className="items-center sm:justify-center">
                    <Button
                      size="lg"
                      onClick={handleAuthenticatedSubscribe}
                      disabled={isAuthenticatedSubmitting}
                      className={SUBSCRIBE_BUTTON_CLASSNAME}
                    >
                      <Mail />
                      {isAuthenticatedSubmitting
                        ? dictionary?.subscribe.modal.subscribing ||
                          "Subscribing..."
                        : dictionary?.subscribe.modal.subscribe || "Subscribe"}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <form
                  onSubmit={handleGuestSubmit}
                  className="w-full space-y-4"
                >
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      dictionary?.subscribe.modal.emailPlaceholder ||
                      "you@example.com"
                    }
                    disabled={isGuestSubmitting}
                    autoComplete="email"
                    className="bg-white/10"
                  />
                  <DialogFooter className="items-center sm:justify-center">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isGuestSubmitting}
                      className={SUBSCRIBE_BUTTON_CLASSNAME}
                    >
                      <Mail />
                      {isGuestSubmitting
                        ? dictionary?.subscribe.modal.subscribing ||
                          "Subscribing..."
                        : dictionary?.subscribe.modal.subscribe || "Subscribe"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
