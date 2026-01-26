import { prisma } from "@/lib/prisma";
import { buildTransactionWhere } from "@/lib/transactions/buildWhere";
import { TransactionWithRelations } from "@/lib/transactions/types";

interface GetTransactionsParams {
  userId: string;
  q?: string;
  month?: string;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  walletId?: string;
  page: number;
  pageSize?: number;
}

export async function getTransactions({
  userId,
  q,
  month,
  type,
  categoryId,
  walletId,
  page,
  pageSize = 10,
}: GetTransactionsParams) {
  const where = buildTransactionWhere({
    userId,
    q,
    month,
    type,
    categoryId,
    walletId,
  });

  const skip = (page - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { date: "desc" }, // Ensure consistent ordering
      include: {
        category: { select: { name: true, type: true, color: true } },
        wallet: { select: { name: true } },
        toWallet: { select: { name: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions: transactions as TransactionWithRelations[],
    totalCount,
    totalPages,
  };
}
