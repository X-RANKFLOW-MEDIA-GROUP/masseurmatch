import { useEffect, useState } from "react";
import { requestJson } from "@/app/_lib/request";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export function useNotifications(unreadOnly = false) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await requestJson<{ ok: boolean; notifications: Notification[] }>(
          `/api/provider/notifications?unread_only=${unreadOnly}&limit=50`
        );
        setNotifications(data.notifications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [unreadOnly]);

  const markAsRead = async (id: string) => {
    try {
      await requestJson(`/api/provider/notifications?id=${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return { notifications, loading, error, markAsRead, unreadCount };
}
