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
import ImportOFXButton from "@/components/transactions/ImportOFXButton";
import ImportOFXModal from "@/components/transactions/ImportOFXModal";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * TransactionsPage - Transactions Management Dashboard
 * 
 * This page uses a hybrid rendering strategy:
 * 1. Immediate Shell: Header, MonthPicker, Searchbar, and Filters are fetched outside 
 *    the Suspense boundary to ensure the UI shell and navigational controls are zero-delay.
 * 2. Streaming Data: The transaction list itself is wrapped in <Suspense> and handled 
 *    by the <TransactionList> component, which performs the heavy database operations.
 */
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in.</div>;
  }

  // Next.js 15: searchParams must be awaited
  const resolvedParams = await searchParams;
  const { month } = resolvedParams;

  // FETCH STRATEGY: 
  // We fetch categories and wallets in parallel here. These are relatively small datasets.
  // We need them for BOTH the Filter bar (immediate) and the Add Modal (also immediate).
  const [categories, wallets] = await Promise.all([
    getCachedCategories(user.id),
    getCachedWallets(user.id),
  ]);

  // Handle month selection for the dynamic subtitle
  const selectedMonth = month ? parseISO(`${month}-01`) : new Date();

  return (
    <div className="space-y-6 pb-16">
      {/* 
          1. Header Section 
          Displays the title and the MonthPicker/AddButton.
          The title shows the selected month if the month filter is active.
      */}
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-lg md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Transactions
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage and track all your financial transactions
              {month && ` • ${format(selectedMonth, "MMMM yyyy")}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="scale-[0.85] xs:scale-90 sm:scale-100 origin-right flex items-center gap-2">
            <MonthPicker />
            <ImportOFXButton />
          </div>
          <AddTransactionButton />
        </div>
      </div>

      {/* 
          2. Filtering & Search Block
          The Searchbar and Filters are rendered immediately.
      */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 w-full">
          <Searchbar />
        </div>
        <div className="w-full sm:w-auto">
          <TransactionFilters categories={categories as any} wallets={wallets as any} />
        </div>
      </div>

      {/* 
          3. Streaming Transaction List
          The table body is streamed to the browser as a separate chunk.
          Using the searchParams as a key ensures that the Suspense fallback 
          triggers on every filter change.
      */}
      <Suspense
        key={JSON.stringify(resolvedParams)}
        fallback={<TransactionTableSkeleton />}
      >
        <TransactionList userId={user.id} searchParams={resolvedParams} />
      </Suspense>

      {/* 
          4. Global Modals
          Modal components are kept at the bottom to maintain a clean structure.
          They share the same categories/wallets data.
      */}
      <AddTransactionModal categories={categories as any} wallets={wallets as any} />
      <ImportOFXModal wallets={wallets as any} />
    </div>
  );
};

/**
 * Loading Placeholder for the Transactions Table
 */
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

