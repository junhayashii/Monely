import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/AppSidebar";
import { getUnreadNotificationCount } from "./notifications/actions";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const unreadCount = await getUnreadNotificationCount();

  return (
    <CurrencyProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <SidebarProvider>
          <AppSidebar unreadNotificationCount={unreadCount} />
          <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">{children}</main>
        </SidebarProvider>
      </div>
    </CurrencyProvider>
  );
};

export default DashboardLayout;
