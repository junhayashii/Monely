import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, format } from "date-fns";
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
import BudgetProgress from "./BudgetProgress";

interface BottomSectionWrapperProps {
  userId: string;
  currentMonth: Date;
}

export default async function BottomSectionWrapper({
  userId,
  currentMonth,
}: BottomSectionWrapperProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Optimized parallel queries
  const [recentTransactions, categories, categoryGrouped] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      include: {
        category: { select: { name: true, type: true } },
        wallet: { select: { name: true } },
        toWallet: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      take: 4,
    }),
    prisma.category.findMany({
      where: { userId, type: "EXPENSE", budget: { gt: 0 } },
      select: { id: true, name: true, budget: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
        toWalletId: null,
      },
      _sum: { amount: true },
    }),
  ]);

  const spentMap = categoryGrouped.reduce((acc, curr) => {
    if (curr.categoryId) acc[curr.categoryId] = curr._sum.amount || 0;
    return acc;
  }, {} as Record<string, number>);

  const budgetData = categories.map((cat) => {
    const spent = spentMap[cat.id] || 0;
    const budget = cat.budget || 0;
    const progress = (spent / budget) * 100;
    return {
      name: cat.name,
      spent,
      budget,
      progress: Math.min(progress, 100),
      status: progress > 90 ? "text-rose-600" : "text-emerald-600",
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-4 items-stretch">
      {/* Recent Transactions */}
      <div className="md:col-span-2">
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
                const typeLabel = isTransfer ? "Transfer" : isIncome ? "Income" : "Expense";
                
                const iconWrapperClasses = isTransfer
                  ? "bg-sky-100 text-sky-600 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30"
                  : isIncome
                  ? "bg-emerald-100 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                  : "bg-rose-100 text-rose-600 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30";

                return (
                  <div key={t.id} className="group flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors duration-200 hover:border-slate-200/80 hover:bg-white/60 dark:hover:border-slate-800/80 dark:hover:bg-slate-900/60">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${iconWrapperClasses}`}>
                        {isTransfer ? <ArrowRightLeft className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{t.title}</p>
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-tight">
                            {typeLabel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(t.date), "MMM dd")} • {isTransfer ? `${t.wallet?.name} ➔ ${t.toWallet?.name}` : t.wallet?.name}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold tracking-tight ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                      {!isTransfer && (isIncome ? "+" : "-")} R {t.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <div className="md:col-span-2">
        <BudgetProgress data={budgetData.slice(0, 6)} />
      </div>
    </div>
  );
}
