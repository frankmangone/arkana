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
      <DialogContent>
        {view === "checkEmail" ? (
          <DialogHeader>
            <DialogTitle>
              {dictionary?.subscribe.modal.checkEmailTitle ||
                "Check your email"}
            </DialogTitle>
            <DialogDescription>
              {dictionary?.subscribe.modal.checkEmailDescription ||
                "We've sent a confirmation link to your inbox."}
            </DialogDescription>
          </DialogHeader>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {dictionary?.subscribe.modal.title || "Never miss a post"}
              </DialogTitle>
              <DialogDescription>
                {dictionary?.subscribe.modal.description ||
                  "Get an email whenever we publish something new."}
              </DialogDescription>
            </DialogHeader>

            {isLoggedIn ? (
              <DialogFooter>
                <Button
                  onClick={handleAuthenticatedSubscribe}
                  disabled={isAuthenticatedSubmitting}
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
                  <Button type="submit" disabled={isGuestSubmitting}>
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
      </DialogContent>
    </Dialog>
  );
}
