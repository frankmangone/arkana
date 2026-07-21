import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  NotificationsListResponse,
  UnreadCountResponse,
  MarkReadResponse,
} from "../services/notifications";
import { trackEvent, EVENTS } from "@/lib/analytics";

const DROPDOWN_PAGE_SIZE = 5;
const FULL_PAGE_SIZE = 20;

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (limit: number, offset: number) =>
    [...notificationKeys.all, "list", limit, offset] as const,
  infinite: () => [...notificationKeys.all, "infinite"] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

/**
 * Unread notification count. Fetched once per mount (default React Query
 * behavior) — no polling.
 */
export function useUnreadCount(enabled: boolean) {
  return useQuery<UnreadCountResponse, Error>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    enabled,
  });
}

/**
 * The bell dropdown's short list. Pass `enabled: open` so it's only
 * fetched once the dropdown is actually opened.
 */
export function useNotificationsList(enabled: boolean) {
  return useQuery<NotificationsListResponse, Error>({
    queryKey: notificationKeys.list(DROPDOWN_PAGE_SIZE, 0),
    queryFn: () => getNotifications(DROPDOWN_PAGE_SIZE, 0),
    enabled,
  });
}

/**
 * The full /notifications page — offset-paginated, same shape as
 * useUnifiedSearch (see src/lib/api/hooks/useSearch.ts).
 */
export function useNotificationsInfinite(enabled: boolean) {
  return useInfiniteQuery<NotificationsListResponse, Error>({
    queryKey: notificationKeys.infinite(),
    queryFn: ({ pageParam }) =>
      getNotifications(FULL_PAGE_SIZE, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedSoFar = allPages.reduce(
        (sum, page) => sum + page.notifications.length,
        0
      );
      return fetchedSoFar < lastPage.total ? fetchedSoFar : undefined;
    },
    enabled,
  });
}

/**
 * Marks one notification read. Invalidates all notification queries so the
 * badge count and any visible lists reflect the change.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkReadResponse, Error, number>({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      trackEvent(EVENTS.NOTIFICATION_MARKED_READ);
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
