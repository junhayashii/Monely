import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import TransactionManager from "./TransactionManager";
import TransactionPagination from "./TransactionPagination";
import { getCachedCategories, getCachedWallets } from "@/lib/data-fetching";

const PAGE_SIZE = 10;

interface TransactionListProps {
  userId: string;
  searchParams: {
    q?: string;
    month?: string;
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    walletId?: string;
    page?: string;
  };
}

export default async function TransactionList({
  userId,
  searchParams,
}: TransactionListProps) {
  const { q, month, type, categoryId, walletId, page } = searchParams;

  const currentPage = Number(page) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;
  const where: Prisma.TransactionWhereInput = {
    userId,
  };

  if (q?.trim()) {
    where.title = {
      contains: q.trim(),
      mode: "insensitive",
    };
  }

  if (month) {
    const referenceDate = parseISO(`${month}-01`);
    where.date = {
      gte: startOfMonth(referenceDate),
      lte: endOfMonth(referenceDate),
    };
  }

  if (type) {
    where.category = { type: type };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (walletId) {
    where.walletId = walletId;
  }

  const [transactions, totalCount, categories, wallets] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      select: {
        id: true,
        title: true,
        amount: true,
        date: true,
        categoryId: true,
        walletId: true,
        toWalletId: true,
        category: { select: { name: true, type: true, color: true } },
        wallet: { select: { name: true } },
        toWallet: { select: { name: true } },
      },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
    getCachedCategories(userId),
    getCachedWallets(userId),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <TransactionManager
      transactions={transactions as any}
      categories={categories as any}
      wallets={wallets as any}
      pagination={
        totalPages > 1 ? (
          <TransactionPagination
            totalPages={totalPages}
            currentPage={currentPage}
            skip={skip}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
          />
        ) : undefined
      }
    />
  );
}
