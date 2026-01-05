import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/AppSidebar";
import { getUnreadNotificationCount } from "./notifications/actions";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const unreadCount = await getUnreadNotificationCount();

  return (
    <CurrencyProvider>
      <div className="flex min-h-screen">
        <SidebarProvider>
          <AppSidebar unreadNotificationCount={unreadCount} />
          <main className="flex-1 p-6">{children}</main>
        </SidebarProvider>
      </div>
    </CurrencyProvider>
  );
};

export default DashboardLayout;
