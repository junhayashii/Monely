"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import { PieChart as PieChartIcon } from "lucide-react";

interface BudgetStatsProps {
  totalExpense: number;
  totalBudget: number;
  overallProgress: number;
  remainingBudget: number;
}

export default function BudgetStats({
  totalExpense,
  totalBudget,
  overallProgress,
  remainingBudget,
}: BudgetStatsProps) {
  const { formatCurrency } = useCurrency();

  const getStatusColor = () => {
    if (overallProgress >= 100)
      return {
        bg: "bg-rose-100 dark:bg-rose-900/30",
        text: "text-rose-600 dark:text-rose-400",
        bar: "from-rose-500 to-rose-600",
      };
    if (overallProgress > 85)
      return {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-600 dark:text-amber-400",
        bar: "from-amber-400 to-amber-500",
      };
    return {
      bg: "bg-sky-100 dark:bg-sky-900/30",
      text: "text-sky-600 dark:text-sky-400",
      bar: "from-sky-400 to-sky-500",
    };
  };

  const status = getStatusColor();

  return (
    <div className="xl:col-span-2 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center shadow-sm">
      <div className={`absolute top-0 right-0 p-8 opacity-5 ${status.text}`}>
        <PieChartIcon className="w-48 h-48" />
      </div>

      <div className="space-y-6 relative z-10">
        <div className="space-y-2">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.bg} ${status.text} text-[10px] font-bold uppercase tracking-widest`}
          >
            {overallProgress >= 100
              ? "Budget Exceeded"
              : "Total Monthly Budget"}
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalExpense)}{" "}
            <span className="text-slate-400 font-medium text-2xl">
              / {formatCurrency(totalBudget)}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
            {Math.round(overallProgress)}% used. You have{" "}
            {formatCurrency(Math.max(remainingBudget, 0))} remaining to spend
            this month.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Progress</span>
            <span className={overallProgress > 100 ? "text-rose-500" : ""}>
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            {/* ★ プログレスバーのグラデーションを変更 */}
            <div
              className={`h-full bg-linear-to-r ${status.bar} rounded-full shadow-lg transition-all duration-1000`}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
