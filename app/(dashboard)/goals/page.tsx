import { prisma } from "@/lib/prisma";
import GoalList from "@/components/goals/GoalList"; // 先ほど作ったコンポーネント
import AddGoalButton from "@/components/goals/AddGoalButton";
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
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Saving Goals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your savings progress for something special
          </p>
        </div>
        <AddGoalButton />
      </div>

      {/* 2. 取得したデータを GoalList (クライアントコンポーネント) に渡す */}
      <GoalList goals={goals} wallets={wallets} />
    </div>
  );
}
