import { getCachedBottomSectionData } from "@/lib/dashboard-fetching";

import { format } from "date-fns";
import { Wallet, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BottomSectionWrapperProps {
  userId: string;
  currentMonth: Date;
}

async function RecentTransactions({
  userId,
  currentMonth,
}: BottomSectionWrapperProps) {
  const { recentTransactions } = await getCachedBottomSectionData(
    userId,
    currentMonth
  );

  return (
    <Card className="glass-card relative overflow-hidden h-full">
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-linear-to-br from-sky-400/15 via-blue-500/8 to-transparent blur-3xl dark:from-sky-500/10 dark:via-blue-500/5" />
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Recent Transactions
          </CardTitle>
          <CardDescription className="mt-1 text-xs">
            The latest movements this month.
          </CardDescription>
        </div>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <a href="/transactions">View All</a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5">
          {recentTransactions.map((t) => {
            const isTransfer = !!t.toWalletId;
            const isIncome = t.category?.type === "INCOME";
            const typeLabel = isTransfer
              ? "Transfer"
              : isIncome
              ? "Income"
              : "Expense";

            const iconWrapperClasses = isTransfer
              ? "bg-sky-100 text-sky-600 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30"
              : isIncome
              ? "bg-emerald-100 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
              : "bg-rose-100 text-rose-600 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30";

            return (
              <div
                key={t.id}
                className="group flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors duration-200 hover:border-slate-200/80 hover:bg-white/60 dark:hover:border-slate-800/80 dark:hover:bg-slate-900/60"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${iconWrapperClasses}`}
                  >
                    {isTransfer ? (
                      <ArrowRightLeft className="h-4 w-4" />
                    ) : (
                      <Wallet className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {t.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "MMM dd")} •{" "}
                      {isTransfer
                        ? `${t.wallet?.name} ➔ ${t.toWallet?.name}`
                        : t.wallet?.name}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold tracking-tight ${
                    isIncome ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {!isTransfer && (isIncome ? "+" : "-")}
                  R${t.amount.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentTransactions;
