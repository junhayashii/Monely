import WalletList from "@/components/wallets/WalletList";
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
        <p className="text-muted-foreground">
          Manage your bank accounts, credit cards, and cash
        </p>
      </div>

      <hr />

      <WalletList wallets={wallets} />
    </div>
  );
}

export default WalletsPage;
