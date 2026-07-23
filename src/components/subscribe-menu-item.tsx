"use client";

import { Mail, MailX } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useDictionary } from "@/lib/hooks/use-dictionary";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  useSubscriptionStatus,
  useSubscribeAuthenticated,
  useUnsubscribeAuthenticated,
} from "@/lib/api/hooks/useSubscriptions";

export function SubscribeMenuItem() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dictionary = useDictionary(lang);
  const { user } = useAuth();

  const {
    data: statusData,
    isLoading: statusLoading,
    isError: statusErrored,
  } = useSubscriptionStatus(!!user);

  const subscribeAuthenticated = useSubscribeAuthenticated();
  const unsubscribeAuthenticated = useUnsubscribeAuthenticated();

  if (!user || statusLoading || statusErrored) {
    return null;
  }

  const isSubscribed = !!statusData?.subscribed;
  const isPending =
    subscribeAuthenticated.isPending || unsubscribeAuthenticated.isPending;

  const handleClick = async () => {
    try {
      if (isSubscribed) {
        await unsubscribeAuthenticated.mutateAsync();
        toast.success(
          dictionary?.subscribe.accountMenu.unsubscribedToast ||
            "You've been unsubscribed."
        );
      } else {
        await subscribeAuthenticated.mutateAsync();
        toast.success(
          dictionary?.subscribe.modal.subscribedToast || "You're subscribed!"
        );
      }
    } catch {
      toast.error(
        dictionary?.subscribe.modal.errorToast ||
          "Something went wrong. Please try again."
      );
    }
  };

  const label = isPending
    ? isSubscribed
      ? dictionary?.subscribe.accountMenu.unsubscribing || "Unsubscribing..."
      : dictionary?.subscribe.accountMenu.subscribing || "Subscribing..."
    : isSubscribed
      ? dictionary?.subscribe.accountMenu.unsubscribe ||
        "Unsubscribe from newsletter"
      : dictionary?.subscribe.accountMenu.subscribe ||
        "Subscribe to newsletter";

  return (
    <DropdownMenuItem
      className="cursor-pointer py-3 text-base"
      disabled={isPending}
      onClick={handleClick}
    >
      {isSubscribed ? (
        <MailX className="h-4 w-4" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {label}
    </DropdownMenuItem>
  );
}
