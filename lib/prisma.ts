import { PrismaClient } from "@/lib/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// 1. Pool のシングルトン化
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // 必要に応じて最大接続数を明示
    // max: 10, 
  });

// 2. Adapter の作成
const adapter = new PrismaPg(pool);

// 3. PrismaClient のシングルトン化
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

// 開発環境のみグローバルに保存
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = prisma;
}