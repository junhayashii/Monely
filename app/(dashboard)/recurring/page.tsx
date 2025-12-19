import RecurringList from "@/components/recurring/RecurringList";
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Recurring Bills</h1>
      {/* 3つすべてを List に渡します */}
      <RecurringList bills={bills} wallets={wallets} categories={categories} />
    </div>
  );
}
