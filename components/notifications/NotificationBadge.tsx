import { getUnreadNotificationCount } from "@/app/(dashboard)/notifications/actions";
import { Badge } from "@/components/ui/badge";

export default async function NotificationBadge() {
  const unreadCount = await getUnreadNotificationCount();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className="ml-auto text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center"
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
}



