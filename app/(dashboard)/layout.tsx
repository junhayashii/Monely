import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
          <div className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12 overflow-x-hidden">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
    </CurrencyProvider>
  );
};

export default DashboardLayout;
