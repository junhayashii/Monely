import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getCachedCategories = cache(async (userId: string) => {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
    }
  });
});

export const getCachedWallets = cache(async (userId: string) => {
  return prisma.wallet.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
    }
  });
});
