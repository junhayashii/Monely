import RecurringList from "@/components/recurring/RecurringList";
import AddRecurringButton from "@/components/recurring/AddRecurringButton";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";

export default async function RecurringPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていなければリダイレクトなど
    return <div>Please log in.</div>;
  }
  // 1. 配列の中に 3つ目の関数を追加します
  const [bills, wallets, categories] = await Promise.all([
    prisma.recurringBill.findMany({
      where: { userId: user.id },
      orderBy: { nextDate: "asc" },
      include: {
        category: true,
        wallet: true,
      },
    }),
    prisma.wallet.findMany({ where: { userId: user.id } }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }), // ★ これを忘れていませんか？
  ]);

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Bills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscriptions and fixed expenses
          </p>
        </div>
        <AddRecurringButton />
      </div>

      {/* 3つすべてを List に渡します */}
      <RecurringList bills={bills} wallets={wallets} categories={categories} />
    </div>
  );
}
