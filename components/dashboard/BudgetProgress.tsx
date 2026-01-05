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
import { Progress } from "../ui/progress";
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
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      overBudget
                        ? "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/20"
                        : "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20"
                    }`}
                  >
                    {overBudget
                      ? "Over budget"
                      : `${Math.round(item.progress)}%`}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <Progress value={clampedProgress} className="h-2.5" />
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
