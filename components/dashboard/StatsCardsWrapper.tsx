import { getCachedStats } from "@/lib/dashboard-fetching";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import DashboardCard from "./DashboardCard";

interface StatsCardsWrapperProps {
  userId: string;
  currentMonth: Date;
}

export default async function StatsCardsWrapper({
  userId,
  currentMonth,
}: StatsCardsWrapperProps) {
  const { income, expense, balance, totalSaved } = await getCachedStats(userId, currentMonth);


  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
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
  );
}
