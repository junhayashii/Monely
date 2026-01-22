import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import SettingsContent from "@/components/settings/SettingsContent";
import { SidebarTrigger } from "@/components/ui/sidebar";

async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Settings</h1>
            <p className="hidden sm:block text-sm text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <SettingsContent user={user} />
    </div>
  );
}

export default SettingsPage;
