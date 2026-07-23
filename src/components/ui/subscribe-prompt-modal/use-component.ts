"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useDictionary } from "@/lib/hooks/use-dictionary";
import { useSubscribeModalEligibility } from "@/lib/hooks/use-subscribe-modal-eligibility";
import {
  useSubscribeGuest,
  useSubscribeAuthenticated,
} from "@/lib/api/hooks/useSubscriptions";

type View = "form" | "checkEmail";

export function useComponent() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dictionary = useDictionary(lang);

  const { isEligible, isLoggedIn, markShown, markGuestSubscribed } =
    useSubscribeModalEligibility();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("form");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isEligible) {
      markShown();
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEligible]);

  const guestSubscribe = useSubscribeGuest();
  const authenticatedSubscribe = useSubscribeAuthenticated();

  const handleGuestSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await guestSubscribe.mutateAsync(email);
      markGuestSubscribed();
      setView("checkEmail");
    } catch {
      toast.error(
        dictionary?.subscribe.modal.errorToast ||
          "Something went wrong. Please try again."
      );
    }
  };

  const handleAuthenticatedSubscribe = async () => {
    try {
      await authenticatedSubscribe.mutateAsync();
      setOpen(false);
      toast.success(
        dictionary?.subscribe.modal.subscribedToast || "You're subscribed!"
      );
    } catch {
      toast.error(
        dictionary?.subscribe.modal.errorToast ||
          "Something went wrong. Please try again."
      );
    }
  };

  return {
    dictionary,
    open,
    setOpen,
    view,
    email,
    setEmail,
    isLoggedIn,
    isGuestSubmitting: guestSubscribe.isPending,
    isAuthenticatedSubmitting: authenticatedSubscribe.isPending,
    handleGuestSubmit,
    handleAuthenticatedSubscribe,
  };
}
