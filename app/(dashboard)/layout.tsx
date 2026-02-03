import { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/AppSidebar";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import SidebarWithNotificationCount from "./_components/SidebarWithNotificationCount";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CurrencyProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <SidebarProvider>
          <Suspense fallback={<AppSidebar unreadNotificationCount={0} />}>
            <SidebarWithNotificationCount />
          </Suspense>
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
