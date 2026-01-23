import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const getCachedStats = async (userId: string, currentMonth: Date) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const cacheKey = `stats-${userId}-${monthStart.getTime()}`;

  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] Fetching stats for user ${userId} and month ${monthStart.toISOString()}`);
      const [incomeTotal, expenseTotal, goals] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId,
            date: { gte: monthStart, lte: monthEnd },
            toWalletId: null,
            category: { type: "INCOME" },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId,
            date: { gte: monthStart, lte: monthEnd },
            toWalletId: null,
            category: { type: "EXPENSE" },
          },
          _sum: { amount: true },
        }),
        prisma.goal.findMany({
          where: { userId },
          select: { currentAmount: true },
        }),
      ]);

      const income = incomeTotal._sum.amount || 0;
      const expense = expenseTotal._sum.amount || 0;
      const balance = income - expense;
      const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

      return { income, expense, balance, totalSaved };
    },
    [cacheKey],
    {
      tags: [`dashboard-${userId}`],
      revalidate: 3600,
    }
  )();
};

export const getCachedChartsData = async (userId: string, currentMonth: Date) => {
  const monthEnd = endOfMonth(currentMonth);
  const sixMonthsAgo = startOfMonth(subMonths(currentMonth, 5));
  const cacheKey = `charts-${userId}-${sixMonthsAgo.getTime()}-${monthEnd.getTime()}`;

  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] Fetching chars data for user ${userId}`);
      return prisma.transaction.findMany({
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
    },
    [cacheKey],
    {
      tags: [`dashboard-${userId}`],
      revalidate: 3600,
    }
  )();
};

export const getCachedBottomSectionData = async (userId: string, currentMonth: Date) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const cacheKey = `bottom-${userId}-${monthStart.getTime()}`;

  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] Fetching bottom section data for user ${userId}`);
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

      return { recentTransactions, categories, categoryGrouped };
    },
    [cacheKey],
    {
      tags: [`dashboard-${userId}`],
      revalidate: 3600,
    }
  )();
};

