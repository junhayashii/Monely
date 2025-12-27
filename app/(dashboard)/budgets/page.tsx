import BudgetList from "@/components/budgets/BudgetList";
import BudgetHistory from "@/components/budgets/BudgetHistory";
import AddBudgetButton from "@/components/budgets/AddBudgetButton";
import CategoryChart from "@/components/dashboard/CategoryChart";
import MonthPicker from "@/components/MonthPicker";
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
import { PieChart as PieChartIcon } from "lucide-react";

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

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { type: "asc" },
  });

  // 全期間のトランザクションを取得（グラフ用）
  const allTransactions = await prisma.transaction.findMany({
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
  });

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

    // カテゴリのトランザクションを取得
    const categoryTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        categoryId: categoryId,
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
    });

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your monthly budget and income goals
            {month && ` • ${format(selectedMonth, "MMMM yyyy")}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthPicker />
          <AddBudgetButton />
        </div>
      </div>

      {/* Overview Section: Stats + Category Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Stats Card */}
        <div className="xl:col-span-2 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <PieChartIcon className="w-48 h-48" />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 text-[10px] font-bold uppercase tracking-widest">
                Total Monthly Budget
              </div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                R$ {totalExpense.toLocaleString()}{" "}
                <span className="text-slate-400 font-medium text-2xl">
                  / R$ {totalBudget.toLocaleString()}
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                {Math.round(overallProgress)}% used. You have R${" "}
                {Math.max(remainingBudget, 0).toLocaleString()} remaining to
                spend this month.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-linear-to-r from-sky-400 to-sky-500 rounded-full shadow-lg transition-all duration-1000"
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

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
