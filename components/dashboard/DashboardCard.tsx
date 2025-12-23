import type { ReactNode } from "react";

import { Card, CardContent } from "../ui/card";

interface DashboardCardProps {
  title: string;
  amount: number;
  icon: ReactNode;
  trend?: string;
  isPositive?: boolean;
  className?: string;
}

const DashboardCard = ({
  title,
  amount,
  icon,
  trend,
  isPositive = true,
  className = "",
}: DashboardCardProps) => {
  return (
    <Card className="relative overflow-hidden border border-slate-200/70 bg-linear-to-br from-white via-slate-50 to-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full bg-linear-to-br from-sky-400/15 via-blue-500/8 to-transparent blur-3xl dark:from-sky-500/10 dark:via-blue-500/5" />
      <CardContent className="relative px-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          {trend && (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-tight ${
                isPositive
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
                  : "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20"
              }`}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-current" />
              {trend}
            </span>
          )}
          <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-slate-900/5 text-sky-600 ring-1 ring-inset ring-slate-200/70 transition-transform duration-300 group-hover:scale-105 dark:bg-white/5 dark:text-sky-300 dark:ring-slate-800">
            <div className="scale-110">{icon}</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-semibold tracking-tight text-slate-900 dark:text-white ${className}`}
            >
              R${amount.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
