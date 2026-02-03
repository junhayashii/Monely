import AppSidebar from "@/components/sidebar/AppSidebar";
import { getUnreadNotificationCount } from "../notifications/actions";

export default async function SidebarWithNotificationCount() {
  const unreadCount = await getUnreadNotificationCount();
  return <AppSidebar unreadNotificationCount={unreadCount} />;
}
