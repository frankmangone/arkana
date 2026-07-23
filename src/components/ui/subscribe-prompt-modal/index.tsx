"use client";

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

// bg-none cancels the default variant's --grad-brand background-image —
// otherwise the gradient paints over any background-color we set here.
const SUBSCRIBE_BUTTON_CLASSNAME = "bg-none bg-primary-500 hover:bg-primary-600";

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-100/40 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-8">
          {view === "checkEmail" ? (
            <DialogHeader>
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
              <DialogHeader>
                <DialogTitle className="text-2xl text-ink-heading">
                  {dictionary?.subscribe.modal.title || "Never miss a post"}
                </DialogTitle>
                <DialogDescription className="text-ink-body">
                  {dictionary?.subscribe.modal.description ||
                    "Subscribe to our newsletter to get an email every time we publish something new!"}
                </DialogDescription>
              </DialogHeader>

              {isLoggedIn ? (
                <DialogFooter>
                  <Button
                    onClick={handleAuthenticatedSubscribe}
                    disabled={isAuthenticatedSubmitting}
                    className={SUBSCRIBE_BUTTON_CLASSNAME}
                  >
                    {isAuthenticatedSubmitting
                      ? dictionary?.subscribe.modal.subscribing ||
                        "Subscribing..."
                      : dictionary?.subscribe.modal.subscribe || "Subscribe"}
                  </Button>
                </DialogFooter>
              ) : (
                <form onSubmit={handleGuestSubmit} className="space-y-4">
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
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={isGuestSubmitting}
                      className={SUBSCRIBE_BUTTON_CLASSNAME}
                    >
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
