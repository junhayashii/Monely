import WalletList from "@/components/wallets/WalletList";
import AddWalletButton from "@/components/wallets/AddWalletButton";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";

async function WalletsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていなければリダイレクトなど
    return <div>Please log in.</div>;
  }

  const wallets = await prisma.wallet.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your bank accounts, credit cards, and cash
          </p>
        </div>
        <AddWalletButton />
      </div>

      <WalletList wallets={wallets} />
    </div>
  );
}

export default WalletsPage;
