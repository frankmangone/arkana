"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trackEvent, EVENTS } from "@/lib/analytics";

export function AuthButton() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { user, loading, logout } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    const displayName = user.username || user.email;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-[40px] rounded-none py-2 px-4 flex cursor-pointer items-center gap-2 text-base hover:text-primary-750 dark:text-gray-300 dark:hover:text-primary-750"
          >
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={displayName}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
            <span className="hidden sm:inline text-sm truncate max-w-[120px]">
              {displayName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="py-3 text-base" disabled>
            <span className="truncate block w-full text-xs text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer py-3 text-base"
            onClick={() => {
              trackEvent(EVENTS.WALLET_DISCONNECTED);
              logout();
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      asChild
      className="h-[40px] rounded-none py-2 px-4 flex cursor-pointer items-center gap-1 text-base hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-750"
    >
      <Link href={`/${lang}/login`}>
        <User className="h-7 w-7 sm:h-6 sm:w-6" />
        Sign in
      </Link>
    </Button>
  );
}
