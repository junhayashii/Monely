import ReportsContent from "@/components/reports/ReportsContent";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns";
import { redirect } from "next/navigation";
import MonthPicker from "@/components/MonthPicker";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ReportsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolved = await searchParams;
  const monthParam = resolved.month || format(new Date(), "yyyy-MM");
  let currentMonth: Date;
  try {
    const parsed = parse(monthParam, "yyyy-MM", new Date());
    currentMonth = isNaN(parsed.getTime())
      ? startOfMonth(new Date())
      : startOfMonth(parsed);
  } catch {
    currentMonth = startOfMonth(new Date());
  }
  const sixMonthsAgo = startOfMonth(subMonths(currentMonth, 5));
  const monthEnd = endOfMonth(currentMonth);

  // Fetch all data in parallel
  const [allTransactions, categories] = await Promise.all([
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
    prisma.category.findMany({
      where: { userId: user.id },
    }),
  ]);

  // Calculate monthly data
  const lastSixMonths = eachMonthOfInterval({
    start: sixMonthsAgo,
    end: currentMonth,
  });

  let cumulativeBalance = 0;
  const monthlyData = lastSixMonths.map((m) => {
    const monthTransactions = allTransactions.filter((t) =>
      isSameMonth(new Date(t.date), m)
    );
    const inc = monthTransactions
      .filter((t) => !t.toWalletId && t.category?.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const exp = monthTransactions
      .filter((t) => !t.toWalletId && t.category?.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate cumulative balance
    cumulativeBalance += (inc - exp);

    return {
      month: format(m, "MMM"),
      income: inc,
      expense: exp,
      balance: cumulativeBalance,
    };
  });

  // Calculate category totals for current month
  const currentMonthStart = startOfMonth(currentMonth);
  const currentMonthTransactions = allTransactions.filter(
    (t) => new Date(t.date) >= currentMonthStart && new Date(t.date) <= monthEnd
  );

  const categoryTotals = currentMonthTransactions
    .filter((t) => t.category?.type === "EXPENSE" && !t.toWalletId)
    .reduce((acc: { [key: string]: number }, t) => {
      const categoryName = t.category?.name || "Other";
      if (!acc[categoryName]) acc[categoryName] = 0;
      acc[categoryName] += t.amount;
      return acc;
    }, {});

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Math.abs(value),
  }));

  // Calculate insights
  const currentMonthIncome = monthlyData[monthlyData.length - 1]?.income || 0;
  const currentMonthExpense = monthlyData[monthlyData.length - 1]?.expense || 0;
  const previousMonthIncome = monthlyData[monthlyData.length - 2]?.income || 0;
  const previousMonthExpense = monthlyData[monthlyData.length - 2]?.expense || 0;

  const savingsRate =
    currentMonthIncome > 0
      ? ((currentMonthIncome - currentMonthExpense) / currentMonthIncome) * 100
      : 0;

  const topCategory = categoryData.length > 0
    ? categoryData.reduce((max, cat) => (cat.value > max.value ? cat : max), categoryData[0])
    : null;

  const monthlyDelta = (currentMonthIncome - currentMonthExpense) - 
                       (previousMonthIncome - previousMonthExpense);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Reports
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
              {format(currentMonth, "MMMM yyyy")} · Analyze your financial patterns and trends
            </p>
          </div>
        </div>
        <div className="scale-90 sm:scale-100 origin-right">
          <MonthPicker />
        </div>
      </div>
      <ReportsContent
        monthlyData={monthlyData}
        categoryData={categoryData}
        savingsRate={savingsRate}
        topCategory={topCategory}
        monthlyDelta={monthlyDelta}
      />
    </div>
  );
}
