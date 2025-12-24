import BudgetList from "@/components/budgets/BudgetList";
import AddBudgetButton from "@/components/budgets/AddBudgetButton";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { endOfMonth, format, startOfMonth, parseISO } from "date-fns";

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
    if (t.categoryId) {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const selectedMonth = month ? parseISO(`${month}-01`) : new Date();

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your monthly budget and income goals
            {month && ` • ${format(selectedMonth, "MMMM yyyy")}`}
          </p>
        </div>
        <AddBudgetButton />
      </div>

      {/* ★ クライアントコンポーネントにデータを渡す */}
      <BudgetList categories={categories} spentMap={spentMap} />
    </div>
  );
}

export default BudgetsPage;
