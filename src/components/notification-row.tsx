"use client";

import Link from "next/link";
import { useDictionary } from "@/lib/hooks/use-dictionary";
import { formatTimeAgo } from "@/lib/format-time-ago";
import { withLocalePath } from "@/lib/site-config";
import { useMarkNotificationRead } from "@/lib/api";
import type { NotificationResponse } from "@/lib/api/services/notifications";
import { cn } from "@/lib/utils";

interface NotificationRowProps {
  notification: NotificationResponse;
  lang: string;
  className?: string;
}

function notificationText(notification: NotificationResponse): string {
  switch (notification.type) {
    case "post_liked":
      return `${notification.actor_username} liked your post`;
    case "comment_reply":
      return `${notification.actor_username} replied to your comment`;
    case "post_commented":
      return `${notification.actor_username} commented on your post`;
    default:
      return `${notification.actor_username} sent you a notification`;
  }
}

function notificationHref(
  notification: NotificationResponse,
  lang: string
): string | null {
  if (!notification.post_path) return null;
  const base = withLocalePath(lang, `blog/${notification.post_path}`);
  return notification.type === "post_liked" ? base : `${base}#comments`;
}

export function NotificationRow({
  notification,
  lang,
  className,
}: NotificationRowProps) {
  const dictionary = useDictionary(lang);
  const markRead = useMarkNotificationRead();
  const href = notificationHref(notification, lang);
  const isUnread = !notification.read_at;

  const handleClick = () => {
    if (isUnread) {
      markRead.mutate(notification.id);
    }
  };

  const content = (
    <div className={cn("flex items-start gap-3 px-2 py-3", className)}>
      {isUnread && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-700"
          aria-hidden
        />
      )}
      <div className={cn("min-w-0 flex-1", !isUnread && "pl-5")}>
        <p className="text-sm text-ink-body">{notificationText(notification)}</p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {formatTimeAgo(notification.created_at, dictionary, lang)}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return <div className="opacity-60">{content}</div>;
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="block rounded-sm transition-colors hover:bg-white/5"
    >
      {content}
    </Link>
  );
}
