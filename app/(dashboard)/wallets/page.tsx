import WalletList from "@/components/wallets/WalletList";
import AddWalletButton from "@/components/wallets/AddWalletButton";
import { createClient } from "@/lib/supabase";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCachedWallets } from "@/lib/data-fetching";

async function WalletsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていなければリダイレクトなど
    return <div>Please log in.</div>;
  }

  const wallets = await getCachedWallets(user.id);


  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Wallets</h1>
            <p className="hidden sm:block text-sm text-muted-foreground mt-1">
              Manage your bank accounts, credit cards, and cash
            </p>
          </div>
        </div>
        <AddWalletButton />
      </div>

      <WalletList wallets={wallets} />
    </div>
  );
}

export default WalletsPage;
