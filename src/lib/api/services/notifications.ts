import apiClient from "../client";

export type NotificationType = "comment_reply" | "post_liked" | "post_commented";

export interface NotificationResponse {
  id: number;
  actor_username: string;
  actor_avatar_url?: string | null;
  type: NotificationType;
  post_path?: string | null;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationsListResponse {
  notifications: NotificationResponse[];
  total: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadResponse {
  read: boolean;
}

/**
 * Get a page of the current user's notifications, newest first.
 */
export async function getNotifications(
  limit: number,
  offset: number
): Promise<NotificationsListResponse> {
  const response = await apiClient.get<NotificationsListResponse>(
    `/api/notifications?limit=${limit}&offset=${offset}`
  );
  return response.data;
}

/**
 * Get the current user's unread notification count.
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await apiClient.get<UnreadCountResponse>(
    "/api/notifications/unread-count"
  );
  return response.data;
}

/**
 * Mark one notification read. Bearer token is sent automatically by the axios interceptor.
 */
export async function markNotificationRead(id: number): Promise<MarkReadResponse> {
  const response = await apiClient.post<MarkReadResponse>(
    `/api/notifications/${id}/read`
  );
  return response.data;
}
