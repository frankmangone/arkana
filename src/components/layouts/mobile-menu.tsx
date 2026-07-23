"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { withLocalePath } from "@/lib/site-config";
import { SubscribeMenuItem } from "@/components/subscribe-menu-item";

interface MobileMenuProps {
  lang: string;
  labels: {
    readingLists: string;
    survey: string;
  };
}

/**
 * Hamburger menu for small screens: navigation links plus the sign-in /
 * account actions that live as standalone navbar controls on desktop.
 */
export function MobileMenu({ lang, labels }: MobileMenuProps) {
  const { user, loading, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 cursor-pointer">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link
            href={withLocalePath(lang, "reading-lists")}
            className="w-full cursor-pointer py-3 text-base"
          >
            {labels.readingLists}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={withLocalePath(lang, "survey")}
            className="w-full cursor-pointer py-3 text-base"
          >
            {labels.survey}
          </Link>
        </DropdownMenuItem>

        {!loading && (
          <>
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuItem className="py-3 text-base" disabled>
                  <span className="block w-full truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <SubscribeMenuItem />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-3 text-base"
                  onClick={() => {
                    trackEvent(EVENTS.WALLET_DISCONNECTED);
                    logout();
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link
                  href={`/${lang}/login`}
                  className="w-full cursor-pointer py-3 text-base"
                >
                  <User className="h-4 w-4" />
                  Sign in
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
