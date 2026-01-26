import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getCachedCategories = async (userId: string) => {
  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] Fetching categories for user ${userId}`);
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
    },
    [`categories-${userId}`],
    {
      tags: [`categories-${userId}`],
      revalidate: 3600, // 1 hour
    }
  )();
};

export const getCachedWallets = async (userId: string) => {
  return unstable_cache(
    async () => {
      console.log(`[Cache Miss] Fetching wallets for user ${userId}`);
      return prisma.wallet.findMany({
        where: { userId },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          balance: true,
        }
      });
    },
    [`wallets-${userId}`],
    {
      tags: [`wallets-${userId}`],
      revalidate: 3600, // 1 hour
    }
  )();
};

