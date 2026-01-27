"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, User2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function AuthButton() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      window.location.href = `/${lang}`;
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-[40px] rounded-none py-2 px-4 flex cursor-pointer items-center gap-1 text-base hover:text-primary-750 dark:text-gray-300 dark:hover:text-primary-750"
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
