import RecurringList from "@/components/recurring/RecurringList";
import { prisma } from "@/lib/prisma";

export default async function RecurringPage() {
  // 1. 配列の中に 3つ目の関数を追加します
  const [bills, wallets, categories] = await Promise.all([
    prisma.recurringBill.findMany({
      orderBy: { nextDate: "asc" },
      include: {
        category: true,
        wallet: true,
      },
    }),
    prisma.wallet.findMany(),
    prisma.category.findMany({ orderBy: { name: "asc" } }), // ★ これを忘れていませんか？
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Recurring Bills</h1>
      {/* 3つすべてを List に渡します */}
      <RecurringList bills={bills} wallets={wallets} categories={categories} />
    </div>
  );
}
