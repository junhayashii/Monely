import RecurringList from "@/components/recurring/RecurringList";
import AddRecurringButton from "@/components/recurring/AddRecurringButton";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function RecurringPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていなければリダイレクトなど
    return <div>Please log in.</div>;
  }
  // 1. 配列の中に 3つ目の関数を追加します
  const [bills, wallets, categories] = await Promise.all([
    prisma.recurringBill.findMany({
      where: { userId: user.id },
      orderBy: { nextDate: "asc" },
      include: {
        category: true,
        wallet: true,
      },
    }),
    prisma.wallet.findMany({ where: { userId: user.id } }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }), // ★ これを忘れていませんか？
  ]);

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recurring Bills
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your subscriptions and fixed expenses
            </p>
          </div>
        </div>
        <AddRecurringButton />
      </div>

      {/* 3つすべてを List に渡します */}
      <RecurringList bills={bills} wallets={wallets} categories={categories} />
    </div>
  );
}
