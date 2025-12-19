import BudgetList from "@/components/budgets/BudgetList";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { endOfMonth, format, startOfMonth } from "date-fns";

async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていなければリダイレクトなど
    return <div>Please log in.</div>;
  }

  const { month } = await searchParams;
  const monthParam = month || format(new Date(), "yyyy-MM");
  const targetDate = new Date(`${monthParam}-01`);

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { type: "asc" },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfMonth(targetDate),
        lte: endOfMonth(targetDate),
      },
    },
  });

  const spentMap = transactions.reduce((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Budgets</h1>
      {/* ★ クライアントコンポーネントにデータを渡す */}
      <BudgetList categories={categories} spentMap={spentMap} />
    </div>
  );
}

export default BudgetsPage;
