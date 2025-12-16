import CategoryChart from "@/components/dashboard/CategoryChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import MonthPicker from "@/components/MonthPicker";
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
      </div>

      {/* グラフエリア */}
      <div className="grid gap-4 md:grid-cols-7">
        <CategoryChart data={chartData} />
      </div>
    </div>
  );
}

export default DashboardPage;
