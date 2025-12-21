import { AuthSuccessToast } from "@/components/auth/AuthSuccessToast";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import CategoryChart from "@/components/dashboard/CategoryChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MonthPicker from "@/components/MonthPicker";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase"; // 追加
import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { redirect } from "next/navigation"; // 追加
import { Toaster } from "sonner";

// 1. 型定義を修正（month に加えて auth も受け取れるようにする）
type Props = {
  searchParams: Promise<{
    month?: string;
    auth?: string;
  }>;
};

async function DashboardPage({ searchParams }: Props) {
  // 3. パラメータの解決（authStatus は resolvedParams.auth のこと）
  const resolvedParams = await searchParams;
  const month = resolvedParams.month;
  const authStatus = resolvedParams.auth; // これを AuthSuccessToast に渡す

  // 2. 認証チェック：ログインユーザーのIDを取得
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログインしていなければ強制リダイレクト
  if (!user) {
    redirect("/login");
  }

  console.log("Resolved authStatus:", authStatus);

  const monthParam = month || format(new Date(), "yyyy-MM");
  const currentMonth = parse(monthParam, "yyyy-MM", new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // 4. Prisma クエリすべてに userId: user.id を追加（自分のデータだけ出す）
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id, // ★重要
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      category: true,
    },
  });

  // --- 集計ロジック（変更なし） ---
  const income = transactions
    .filter((t) => t.category?.type === "INCOME" && !t.toWalletId)
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.category?.type === "EXPENSE" && !t.toWalletId)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  const categoryTotals = transactions
    .filter((t) => t.category?.type === "EXPENSE" && !t.toWalletId) // ★ここを追加
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

  const categories = await prisma.category.findMany();

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

  const [goals, recentTransactions] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { date: "desc" },
      include: {
        category: true,
        wallet: true,
        toWallet: true, // ★ これを追加！
      },
    }),
  ]);

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
          title="Balance"
          amount={balance}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          description="Total balance this month"
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

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <CategoryChart data={chartData} />
        </div>
        <div className="md:col-span-2">
          <BudgetProgress data={budgetData} />
        </div>
      </div>

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
                {recentTransactions.map((t) => {
                  const isTransfer = !!t.toWalletId;
                  const isIncome = t.category?.type === "INCOME";

                  // 表示設定の出し分け
                  const statusColor = isTransfer
                    ? "bg-blue-100 text-blue-600"
                    : isIncome
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600";

                  const amountPrefix = isTransfer ? "" : isIncome ? "+" : "-";

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
                          <Wallet
                            className={`h-4 w-4 ${statusColor.split(" ")[1]}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {t.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.date), "MMM dd, yyyy")} •{" "}
                            {
                              t.toWalletId // 振替先IDがあるかチェック
                                ? `${t.wallet?.name} ➔ ${t.toWallet?.name}` // 振替の場合
                                : t.wallet?.name // 通常の場合
                            }
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          statusColor.split(" ")[1]
                        }`}
                      >
                        {amountPrefix} R$ {t.amount.toLocaleString()}
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
