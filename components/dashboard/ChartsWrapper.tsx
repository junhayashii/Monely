import { prisma } from "@/lib/prisma";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import SpendingChart from "./SpendingChart";
import CategoryChart from "./CategoryChart";

interface ChartsWrapperProps {
  userId: string;
  currentMonth: Date;
}

export default async function ChartsWrapper({
  userId,
  currentMonth,
}: ChartsWrapperProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const sixMonthsAgo = startOfMonth(subMonths(currentMonth, 5));

  // Optimized query with specific selection
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: sixMonthsAgo, lte: monthEnd },
      toWalletId: null,
    },
    select: {
      date: true,
      amount: true,
      category: { select: { type: true, name: true } },
    },
  });

  const currentMonthTransactions = transactions.filter(
    (t) => t.date >= monthStart && t.date <= monthEnd
  );

  // --- Category Distribution ---
  const categoryTotals = currentMonthTransactions
    .filter((t) => t.category?.type === "EXPENSE")
    .reduce((acc: { [key: string]: number }, t) => {
      const name = t.category?.name || "Other";
      acc[name] = (acc[name] || 0) + t.amount;
      return acc;
    }, {});

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  // --- Monthly Daily Data ---
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthlyData = daysInMonth.map((day) => {
    const amount = currentMonthTransactions
      .filter((t) => t.category?.type === "EXPENSE" && isSameDay(t.date, day))
      .reduce((sum, t) => sum + t.amount, 0);
    return { day: format(day, "d"), amount };
  });

  // --- Yearly Monthly Data (Last 6 Months) ---
  const lastSixMonths = eachMonthOfInterval({
    start: sixMonthsAgo,
    end: currentMonth,
  });
  const yearlyData = lastSixMonths.map((m) => {
    const mTransactions = transactions.filter((t) => isSameMonth(t.date, m));
    const income = mTransactions
      .filter((t) => t.category?.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = mTransactions
      .filter((t) => t.category?.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      month: format(m, "MMM"),
      income,
      expense,
      balance: income - expense,
    };
  });

  return (
    <div className="grid gap-3 md:grid-cols-3 items-stretch">
      <div className="md:col-span-2">
        <SpendingChart monthlyData={monthlyData} yearlyData={yearlyData} />
      </div>
      <div className="md:col-span-1">
        <CategoryChart data={chartData} />
      </div>
    </div>
  );
}
