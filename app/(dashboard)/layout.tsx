import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/AppSidebar";
import { Toaster } from "sonner";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 p-6">
          <SidebarTrigger />
          {children}
          <Toaster richColors position="top-right" />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
