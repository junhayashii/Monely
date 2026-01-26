import { Prisma } from "@/lib/generated/prisma";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";

export function buildTransactionWhere({
  userId,
  q,
  month,
  type,
  categoryId,
  walletId,
}: {
  userId: string;
  q?: string;
  month?: string;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  walletId?: string;
}): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }

  if (month) {
    const date = parseISO(`${month}-01`);
    where.date = {
      gte: startOfMonth(date),
      lte: endOfMonth(date),
    };
  }

  if (type) {
    where.category = { type };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (walletId) {
    where.walletId = walletId;
  }

  return where;
}
