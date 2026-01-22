import { AuthSuccessToast } from "@/components/auth/AuthSuccessToast";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import CategoryChart from "@/components/dashboard/CategoryChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import SpendingChart from "@/components/dashboard/SpendingChart";
import MonthPicker from "@/components/MonthPicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns";
import { TrendingDown, TrendingUp, Wallet, ArrowRightLeft } from "lucide-react";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    month?: string;
    auth?: string;
  }>;
};

async function DashboardPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const month = resolvedParams.month;
  const authStatus = resolvedParams.auth;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --- 期間の設定 ---
  const monthParam = month || format(new Date(), "yyyy-MM");
  const currentMonth = parse(monthParam, "yyyy-MM", new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const sixMonthsAgo = startOfMonth(subMonths(currentMonth, 5));

  // --- データベースクエリを分割：今月分・6ヶ月分 ---
  // 今月分トランザクションだけ取得
  const [currentTransactions, lastSixMonthTransactions, goals, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      include: {
        category: true,
        wallet: true,
        toWallet: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: sixMonthsAgo, lte: monthEnd },
      },
      include: {
        category: true,
        wallet: true,
        toWallet: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.goal.findMany({ where: { userId: user.id } }),
    prisma.category.findMany(),
  ]);

  // --- 集計：今月の Income / Expense / Balance ---
  const income = currentTransactions
    .filter((t) => t.category?.type === "INCOME" && !t.toWalletId)
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = currentTransactions
    .filter((t) => t.category?.type === "EXPENSE" && !t.toWalletId)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  // --- 集計：カテゴリ別支出 (円グラフ用) ---
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

  // --- チャート用：今月の日別支出集計 ---
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthlyData = daysInMonth.map((day) => {
    const dayExpense = currentTransactions
      .filter(
        (t) =>
          !t.toWalletId &&
          t.category?.type === "EXPENSE" &&
          isSameDay(new Date(t.date), day)
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      day: format(day, "d"),
      amount: dayExpense,
    };
  });

  // --- チャート用：過去6ヶ月の月別収支集計 ---
  const lastSixMonths = eachMonthOfInterval({
    start: sixMonthsAgo,
    end: currentMonth,
  });
  const yearlyData = lastSixMonths.map((m) => {
    const monthTransactions = lastSixMonthTransactions.filter((t) =>
      isSameMonth(new Date(t.date), m)
    );
    const inc = monthTransactions
      .filter((t) => !t.toWalletId && t.category?.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const exp = monthTransactions
      .filter((t) => !t.toWalletId && t.category?.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      month: format(m, "MMM"),
      income: inc,
      expense: exp,
      balance: inc - exp,
    };
  });

  // --- 予算・貯金目標の計算 ---
  const budgetData = categories
    .filter((cat) => cat.type === "EXPENSE" && cat.budget && cat.budget > 0)
    .map((cat) => {
      const spent = categoryTotals[cat.name] || 0;
      const budget = cat.budget || 0;
      const progress = (spent / budget) * 100;
      return {
        name: cat.name,
        spent,
        budget,
        progress: Math.min(progress, 100),
        status: progress > 90 ? "text-rose-600" : "text-emerald-600",
      };
    });

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="space-y-8 pb-16">
      <AuthSuccessToast authStatus={authStatus} />

      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
              An Overview of {format(currentMonth, "MMMM yyyy")}
            </p>
          </div>
        </div>
        <div className="scale-90 sm:scale-100 origin-right">
          <MonthPicker />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Current Balance"
          amount={balance}
          icon={<Wallet className="w-5 h-5 text-sky-500" />}
          trend="-2.5%"
          isPositive={false}
          color="#0ea5e9"
        />
        <DashboardCard
          title="Income"
          amount={income}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          className="text-emerald-600"
          color="#34d399"
        />
        <DashboardCard
          title="Expense"
          amount={expense}
          icon={<TrendingDown className="w-5 h-5 text-rose-500" />}
          className="text-rose-600"
          color="#fb7185"
        />
        <DashboardCard
          title="Savings Progress"
          amount={totalSaved}
          icon={<TrendingUp className="w-5 h-5 text-indigo-500" />}
          className="text-indigo-600"
          color="#818cf8"
        />
      </div>

      {/* スペンディングチャート：メインエリア */}
      <div className="grid gap-3 md:grid-cols-3 items-stretch">
        <div className="md:col-span-2">
          <SpendingChart monthlyData={monthlyData} yearlyData={yearlyData} />
        </div>
        <div className="md:col-span-1">
          <CategoryChart data={chartData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 items-stretch">
        {/* 最近の取引セクション */}
        <div className="md:col-span-2">
          <Card className="glass-card relative overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-linear-to-br from-sky-400/15 via-blue-500/8 to-transparent blur-3xl dark:from-sky-500/10 dark:via-blue-500/5" />
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold tracking-tight">
                  Recent Transactions
                </CardTitle>
                <CardDescription className="mt-1 text-xs">
                  The latest movements across your wallets this month.
                </CardDescription>
              </div>
              <CardAction>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/transactions">View All</a>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {currentTransactions.slice(0, 4).map((t) => {
                  const isTransfer = !!t.toWalletId;
                  const isIncome = t.category?.type === "INCOME";

                  const typeLabel = isTransfer
                    ? "Transfer"
                    : isIncome
                    ? "Income"
                    : "Expense";

                  const iconWrapperClasses = isTransfer
                    ? "bg-sky-100 text-sky-600 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30"
                    : isIncome
                    ? "bg-emerald-100 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                    : "bg-rose-100 text-rose-600 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30";

                  const pillClasses = isTransfer
                    ? "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30"
                    : isIncome
                    ? "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                    : "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30";

                  const amountClasses = isTransfer
                    ? "text-slate-900 dark:text-slate-50"
                    : isIncome
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-rose-600 dark:text-rose-300";

                  return (
                    <div
                      key={t.id}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors duration-200 hover:border-slate-200/80 hover:bg-white/60 dark:hover:border-slate-800/80 dark:hover:bg-slate-900/60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${iconWrapperClasses}`}
                        >
                          {isTransfer ? (
                            <ArrowRightLeft className="h-4 w-4" />
                          ) : (
                            <Wallet className="h-4 w-4" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                              {t.title}
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-tight ring-1 ring-inset ${pillClasses}`}
                            >
                              {typeLabel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.date), "MMM dd, yyyy")} •{" "}
                            {isTransfer
                              ? `${t.wallet?.name} ➔ ${t.toWallet?.name}`
                              : t.wallet?.name}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold tracking-tight ${amountClasses}`}
                      >
                        {!isTransfer && (isIncome ? "+" : "-")} R{" "}
                        {t.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <BudgetProgress data={budgetData} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
