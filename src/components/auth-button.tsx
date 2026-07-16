"use client";

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
          <button
            type="button"
            className="eyebrow inline-flex cursor-pointer items-center gap-2 px-4 py-2 transition-colors hover:text-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={displayName}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="hidden sm:inline truncate max-w-[120px]">
              {displayName}
            </span>
          </button>
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
    <Link
      href={`/${lang}/login`}
      className="eyebrow inline-flex cursor-pointer items-center gap-1.5 px-4 py-2 transition-colors hover:text-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <User className="h-4 w-4" />
      Sign in
    </Link>
  );
}
