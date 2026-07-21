"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useNotificationsInfinite } from "@/lib/api";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { ArkanaSpinner } from "@/components/ui/arkana-spinner";
import { EndOfFeed } from "@/components/ui/end-of-feed";
import { NotificationRow } from "@/components/notification-row";

interface NotificationsPageProps {
  lang: string;
}

export function NotificationsPage({ lang }: NotificationsPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const { data, isLoading, hasNextPage, fetchNextPage } =
    useNotificationsInfinite(!!user);

  const sentinelRef = useInfiniteScrollTrigger(
    () => fetchNextPage(),
    !!hasNextPage
  );

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-muted text-sm">
          <button
            onClick={() =>
              router.push(
                `/${lang}/login?redirect=${encodeURIComponent(`/${lang}/notifications`)}`
              )
            }
            className="cursor-pointer font-medium text-primary-800 hover:underline"
          >
            Sign in
          </button>{" "}
          to view your notifications.
        </p>
      </div>
    );
  }

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-ink-heading">
        Notifications
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <ArkanaSpinner />
        </div>
      ) : total === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink-muted text-sm">No notifications yet.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-rule">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                lang={lang}
              />
            ))}
          </div>

          {hasNextPage ? (
            <div ref={sentinelRef} className="flex justify-center py-10">
              <ArkanaSpinner />
            </div>
          ) : (
            <EndOfFeed message="You're all caught up" />
          )}
        </>
      )}
    </div>
  );
}
