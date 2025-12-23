import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/AppSidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 p-6">{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
