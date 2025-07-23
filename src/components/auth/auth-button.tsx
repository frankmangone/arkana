"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "../providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, User2 } from "lucide-react";

export function AuthButton() {
  const { user } = useAuth();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-[40px] rounded-none py-2 px-4 flex cursor-pointer items-center gap-1 text-base hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
          >
            <User2 className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="py-3 text-base">
            <span className="truncate block w-full">{user.email}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer py-3 text-base"
            onClick={handleLogout}
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
      onClick={handleLogin}
      className="h-[40px] rounded-none py-2 px-4 flex cursor-pointer items-center gap-1 text-base hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-500"
    >
      <User className="h-7 w-7 sm:h-6 sm:w-6" />
      Sign in
    </Button>
  );
}
