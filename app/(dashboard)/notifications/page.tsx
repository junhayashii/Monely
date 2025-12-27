import { getNotifications, markAllNotificationsAsRead } from "./actions";
import NotificationList from "@/components/notifications/NotificationList";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount > 1 ? "s" : ""
                }`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsAsRead}>
            <Button type="submit" variant="outline" size="sm">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      <NotificationList notifications={notifications} />
    </div>
  );
}

export default NotificationsPage;
