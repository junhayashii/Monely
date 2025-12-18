import { prisma } from "@/lib/prisma";
import GoalList from "@/components/goals/GoalList"; // 先ほど作ったコンポーネント

export default async function GoalsPage() {
  // 1. サーバーサイドでデータを取得
  const [goals, wallets] = await Promise.all([
    prisma.goal.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.wallet.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Saving Goals</h1>

      {/* 2. 取得したデータを GoalList (クライアントコンポーネント) に渡す */}
      <GoalList goals={goals} wallets={wallets} />
    </div>
  );
}
