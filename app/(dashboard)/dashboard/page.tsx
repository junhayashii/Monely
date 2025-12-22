import { AuthSuccessToast } from "@/components/auth/AuthSuccessToast";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import CategoryChart from "@/components/dashboard/CategoryChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import SpendingChart from "@/components/dashboard/SpendingChart";
import MonthPicker from "@/components/MonthPicker";
import { Button } from "@/components/ui/button";
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

  // --- データベースから全データを一括取得 ---
  const [allTransactions, wallets, goals, categories] = await Promise.all([
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
    prisma.wallet.findMany({ where: { userId: user.id } }),
    prisma.goal.findMany({ where: { userId: user.id } }),
    prisma.category.findMany(),
  ]);

  // 今月分だけのデータをメモリ上でフィルタリング
  const currentTransactions = allTransactions.filter(
    (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
  );

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
    const monthTransactions = allTransactions.filter((t) =>
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
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const savingsProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="p-8 space-y-8">
      <AuthSuccessToast authStatus={authStatus} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
        </div>
        <MonthPicker />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Monthly Balance"
          amount={balance}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          description="Net income - expenses this month"
        />
        <DashboardCard
          title="Income"
          amount={income}
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          className="text-emerald-600"
        />
        <DashboardCard
          title="Expense"
          amount={expense}
          icon={<TrendingDown className="h-4 w-4 text-rose-500" />}
          className="text-rose-600"
        />
        <DashboardCard
          title="Savings Progress"
          amount={totalSaved}
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          description={`${Math.round(savingsProgress)}% of total goals`}
          className="text-blue-600"
        />
      </div>

      {/* スペンディングチャート：メインエリア */}
      <div className="w-full">
        <SpendingChart monthlyData={monthlyData} yearlyData={yearlyData} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <CategoryChart data={chartData} />
        </div>
        <div className="md:col-span-2">
          <BudgetProgress data={budgetData} />
        </div>
      </div>

      {/* 最近の取引セクション */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between">
              <h3 className="font-semibold leading-none tracking-tight">
                Recent Transactions
              </h3>
              <Button variant="ghost" size="sm" asChild>
                <a href="/transactions">View All</a>
              </Button>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                {allTransactions.slice(0, 5).map((t) => {
                  const isTransfer = !!t.toWalletId;
                  const isIncome = t.category?.type === "INCOME";
                  const statusColor = isTransfer
                    ? "bg-blue-100 text-blue-600"
                    : isIncome
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600";

                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            statusColor.split(" ")[0]
                          }`}
                        >
                          {isTransfer ? (
                            <ArrowRightLeft className="h-4 w-4" />
                          ) : (
                            <Wallet className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {t.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.date), "MMM dd, yyyy")} •{" "}
                            {isTransfer
                              ? `${t.wallet?.name} ➔ ${t.toWallet?.name}`
                              : t.wallet?.name}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          statusColor.split(" ")[1]
                        }`}
                      >
                        {isTransfer ? "" : isIncome ? "+" : "-"} R${" "}
                        {t.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
