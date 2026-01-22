import BudgetList from "@/components/budgets/BudgetList";
import BudgetHistory from "@/components/budgets/BudgetHistory";
import AddBudgetButton from "@/components/budgets/AddBudgetButton";
import CategoryChart from "@/components/dashboard/CategoryChart";
import BudgetStats from "@/components/budgets/BudgetStats";
import MonthPicker from "@/components/MonthPicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import {
  endOfMonth,
  format,
  startOfMonth,
  parseISO,
  subMonths,
  parse,
  eachMonthOfInterval,
  isSameMonth,
} from "date-fns";

async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; categoryId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていなければリダイレクトなど
    return <div>Please log in.</div>;
  }

  const { month, categoryId } = await searchParams;
  const monthParam = month || format(new Date(), "yyyy-MM");
  const currentMonth = parse(monthParam, "yyyy-MM", new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const sixMonthsAgo = startOfMonth(subMonths(currentMonth, 5));

  const [categories, allTransactions] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { type: "asc" },
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sixMonthsAgo,
          lte: monthEnd,
        },
      },
      include: {
        category: true,
        wallet: true,
        toWallet: true,
      },
      orderBy: { date: "desc" },
    }),
  ]);

  // 今月分だけのデータをメモリ上でフィルタリング
  const currentTransactions = allTransactions.filter(
    (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
  );

  const spentMap = currentTransactions.reduce((acc, t) => {
    if (t.categoryId) {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const selectedMonth = month ? parseISO(`${month}-01`) : new Date();

  // カテゴリ詳細表示の場合
  if (categoryId) {
    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (!selectedCategory) {
      return <div>Category not found.</div>;
    }

    // すでに取得済みの allTransactions からフィルタリング
    const categoryTransactions = allTransactions.filter(t => t.categoryId === categoryId);

    // 月別データを準備
    const lastSixMonths = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: currentMonth,
    });
    const monthlyData = lastSixMonths.map((m) => {
      const monthTransactions = categoryTransactions.filter((t) =>
        isSameMonth(new Date(t.date), m)
      );
      const amount = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        month: format(m, "MMM"),
        amount,
      };
    });

    return (
      <div className="space-y-6 p-2">
        <BudgetHistory
          category={selectedCategory}
          transactions={categoryTransactions}
          monthlyData={monthlyData}
        />
      </div>
    );
  }

  // 通常のリスト表示
  // チャート用データの準備
  const categoryTotals = currentTransactions
    .filter((t) => t.category?.type === "EXPENSE" && !t.toWalletId)
    .reduce((acc: { [key: string]: number }, t) => {
      const categoryName = t.category?.name || "その他";
      if (!acc[categoryName]) acc[categoryName] = 0;
      acc[categoryName] += t.amount;
      return acc;
    }, {});

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  // 合計の計算
  const totalBudget = categories
    .filter((c) => c.type === "EXPENSE" && c.budget)
    .reduce((sum, c) => sum + (c.budget || 0), 0);

  const totalExpense = currentTransactions
    .filter((t) => t.category?.type === "EXPENSE" && !t.toWalletId)
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingBudget = totalBudget - totalExpense;
  const overallProgress =
    totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  return (
    <div className="space-y-8 pb-12 p-2">
      {/* Header with Month Picker */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Budgets</h1>
            <p className="hidden sm:block text-sm text-muted-foreground mt-1">
              Manage your monthly budget and income goals
              {month && ` • ${format(selectedMonth, "MMMM yyyy")}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="scale-90 sm:scale-100 origin-right">
            <MonthPicker />
          </div>
          <AddBudgetButton />
        </div>
      </div>

      {/* Overview Section: Stats + Category Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Stats Card */}
        <BudgetStats
          totalExpense={totalExpense}
          totalBudget={totalBudget}
          overallProgress={overallProgress}
          remainingBudget={remainingBudget}
        />

        {/* Category Chart */}
        <div className="xl:col-span-1">
          <CategoryChart data={chartData} />
        </div>
      </div>

      {/* Budget List */}
      <BudgetList categories={categories} spentMap={spentMap} />
    </div>
  );
}

export default BudgetsPage;
