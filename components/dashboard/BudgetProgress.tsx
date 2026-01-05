"use client";

import React from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";

interface BudgetData {
  name: string;
  spent: number;
  budget: number;
  progress: number;
  status: string;
}

const BudgetProgress = ({ data }: { data: BudgetData[] }) => {
  const { formatCurrency } = useCurrency();
  const hasData = data.length > 0;
  const sortedData = data.slice().sort((a, b) => b.progress - a.progress);
  const displayedData = sortedData.slice(0, 3);
  const hasMore = sortedData.length > 3;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>Top 3 monthly budgets.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {hasMore && (
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <a href="/budgets">View All</a>
              </Button>
            </CardAction>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {!hasData && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No budgets set for this month.
          </p>
        )}

        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
          {displayedData.map((item) => {
            const clampedProgress = Math.min(item.progress, 120);
            const remaining = Math.max(item.budget - item.spent, 0);
            const overBudget = item.spent > item.budget;

            return (
              <div key={item.name} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${
                      overBudget
                        ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {overBudget
                      ? "Over budget"
                      : `${Math.round(item.progress)}%`}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full transition-all ${
                        overBudget
                          ? "bg-rose-500"
                          : item.progress > 90
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${clampedProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-end text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <span className={item.status}>
                      {overBudget
                        ? `+${formatCurrency(item.spent - item.budget)}`
                        : `${formatCurrency(remaining)} left`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
