import { getNotifications, markAllNotificationsAsRead } from "./actions";
import NotificationList from "@/components/notifications/NotificationList";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsAsRead}>
            <Button type="submit" variant="outline" size="sm" className="scale-90 sm:scale-100 origin-right">
              <CheckCheck className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline text-xs font-bold">Mark all as read</span>
              <span className="xs:hidden text-xs font-bold">Read all</span>
            </Button>
          </form>
        )}
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}

export default NotificationsPage;



