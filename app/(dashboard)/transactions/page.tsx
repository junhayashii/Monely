import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionList from "@/components/transactions/TransactionList";
import Searchbar from "@/components/transactions/Searchbar";
import { parseISO, format } from "date-fns";
import MonthPicker from "@/components/MonthPicker";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import { createClient } from "@/lib/supabase";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCachedCategories, getCachedWallets } from "@/lib/data-fetching";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";

const TransactionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    month?: string;
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    walletId?: string;
    page?: string;
  }>;
}) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in.</div>;
  }

  const resolvedParams = await searchParams;
  const { month } = resolvedParams;

  // Fetch filters data in parallel to show filters immediately
  const [categories, wallets] = await Promise.all([
    getCachedCategories(user.id),
    getCachedWallets(user.id),
  ]);

  const selectedMonth = month ? parseISO(`${month}-01`) : new Date();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and track all your financial transactions
            {month && ` • ${format(selectedMonth, "MMMM yyyy")}`}
          </p>
        </div>
        <div className="flex gap-3">
          <MonthPicker />
          <AddTransactionButton />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Searchbar />
        </div>
        <div className="sm:w-auto">
          <TransactionFilters categories={categories as any} wallets={wallets as any} />
        </div>
      </div>

      {/* Transactions Table with Streaming */}
      <Suspense
        key={JSON.stringify(resolvedParams)}
        fallback={<TransactionTableSkeleton />}
      >
        <TransactionList userId={user.id} searchParams={resolvedParams} />
      </Suspense>

      {/* Add Modal (outside suspense so it's always ready) */}
      <AddTransactionModal categories={categories as any} wallets={wallets as any} />
    </div>
  );
};

function TransactionTableSkeleton() {
  return (
    <div className="glass-card rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3 rounded-md" />
                <Skeleton className="h-4 w-1/4 rounded-md opacity-70" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;

