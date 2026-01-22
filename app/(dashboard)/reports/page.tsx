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

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in.</div>;
  }

  // Get data for the last 6 months
  const currentMonth = new Date();
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
    <ReportsContent
      monthlyData={monthlyData}
      categoryData={categoryData}
      savingsRate={savingsRate}
      topCategory={topCategory}
      monthlyDelta={monthlyDelta}
    />
  );
}
