import BudgetProgress from "@/components/dashboard/BudgetProgress";
import CategoryChart from "@/components/dashboard/CategoryChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MonthPicker from "@/components/MonthPicker";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { SearchParams } from "next/dist/server/request/search-params";

type Props = {
  searchParams: Promise<{ month?: string }>;
};

async function DashboardPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const month = resolvedParams.month;
  const monthParam = month || format(new Date(), "yyyy-MM");
  const currentMonth = parse(monthParam, "yyyy-MM", new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      category: true,
    },
  });

  const income = transactions
    .filter((t) => t.category?.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.category?.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  const categoryTotals = transactions
    .filter((t) => t.category.type === "EXPENSE")
    .reduce((acc: { [key: string]: number }, t) => {
      const categoryName = t.category.name;
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
    prisma.goal.findMany(),
    prisma.transaction.findMany({
      take: 5, // 最新5件
      orderBy: { date: "desc" },
      include: { category: true, wallet: true },
    }),
  ]);

  // Savings全体の進捗計算
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const savingsProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">See your data here</p>
        </div>
        {/* Add Button */}
        <MonthPicker />
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Balance Card */}
        <DashboardCard
          title="Balance"
          amount={balance}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          description="Total balance this month"
        />

        {/* Income Card */}
        <DashboardCard
          title="Income"
          amount={income}
          icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
          className="text-emerald-600"
        />

        {/* Expense Card */}
        <DashboardCard
          title="Expense"
          amount={expense}
          icon={<TrendingDown className="h-4 w-4 text-rose-500" />}
          className="text-rose-600"
        />

        <DashboardCard
          title="Savings Progress"
          amount={totalSaved} // 金額として現在の合計を表示
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          description={`${Math.round(savingsProgress)}% of total goals`}
          className="text-blue-600"
        />
      </div>

      {/* グラフエリア */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <CategoryChart data={chartData} />
        </div>
        <div className="md:col-span-2">
          <BudgetProgress data={budgetData} />
        </div>
      </div>

      {/* グラフエリアのさらに下に追加 */}
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
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          t.category?.type === "INCOME"
                            ? "bg-emerald-100"
                            : "bg-rose-100"
                        }`}
                      >
                        <Wallet
                          className={`h-4 w-4 ${
                            t.category?.type === "INCOME"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {t.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(t.date), "MMM dd, yyyy")} •{" "}
                          {t.wallet?.name}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        t.category?.type === "INCOME"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {t.category?.type === "INCOME" ? "+" : "-"} R${" "}
                      {t.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
