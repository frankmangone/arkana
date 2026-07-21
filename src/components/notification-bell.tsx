"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArkanaSpinner } from "@/components/ui/arkana-spinner";
import { NotificationRow } from "@/components/notification-row";
import { useUnreadCount, useNotificationsList } from "@/lib/api";
import { withLocalePath } from "@/lib/site-config";

export function NotificationBell() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useUnreadCount(!!user);
  const { data: listData, isLoading } = useNotificationsList(open && !!user);

  if (loading || !user) {
    return null;
  }

  const unreadCount = unreadData?.count ?? 0;
  const notifications = listData?.notifications ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 cursor-pointer text-ink-muted"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-700 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {isLoading ? (
          <DropdownMenuItem disabled className="justify-center py-6">
            <ArkanaSpinner size={20} />
          </DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem disabled className="py-3 text-base">
            <span className="text-ink-muted text-sm">No notifications yet</span>
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              asChild
              className="cursor-pointer p-0 focus:bg-transparent"
            >
              <NotificationRow notification={notification} lang={lang} />
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center py-2 text-sm">
          <Link href={withLocalePath(lang, "notifications")}>See all</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
