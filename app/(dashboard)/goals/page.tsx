import { prisma } from "@/lib/prisma";
import GoalList from "@/components/goals/GoalList"; // 先ほど作ったコンポーネント
import { createClient } from "@/lib/supabase";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていなければリダイレクトなど
    return <div>Please log in.</div>;
  }
  // 1. サーバーサイドでデータを取得
  const [goals, wallets] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.wallet.findMany({
      where: { userId: user.id },
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
