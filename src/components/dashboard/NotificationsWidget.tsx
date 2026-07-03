"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import { Bell, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function NotificationsWidget() {
  const { notifications, loading, error, markAsRead, unreadCount } = useNotifications(true);

  // Auto-mark approval notifications as read after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        notifications.forEach((n) => {
          if (!n.read_at && n.type === "profile_approved") {
            markAsRead(n.id);
          }
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, markAsRead]);

  if (loading || !notifications.length) {
    return null;
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="border border-slate-200/60 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-500" strokeWidth={2.25} />
          <h3 className="font-sans font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-xs font-semibold text-red-700">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-5 transition-colors ${
              !notification.read_at ? "bg-slate-50" : "bg-white"
            }`}
          >
            <div className="flex gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center pt-0.5">
                {notification.type === "profile_approved" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2.25} />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" strokeWidth={2.25} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-sans font-semibold text-slate-900">
                  {notification.title}
                </h4>
                {notification.body && (
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {notification.body}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(notification.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!notification.read_at && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Mark as read"
                >
                  <X className="h-4 w-4" strokeWidth={2.25} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
