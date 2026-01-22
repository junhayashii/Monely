import { prisma } from "@/lib/prisma";
import GoalList from "@/components/goals/GoalList"; // 先ほど作ったコンポーネント
import AddGoalButton from "@/components/goals/AddGoalButton";
import { createClient } from "@/lib/supabase";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Saving Goals
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track your savings progress for something special
            </p>
          </div>
        </div>
        <AddGoalButton />
      </div>

      {/* 2. 取得したデータを GoalList (クライアントコンポーネント) に渡す */}
      <GoalList goals={goals} wallets={wallets} />
    </div>
  );
}
