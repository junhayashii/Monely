import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getCachedCategories, getCachedWallets } from "@/lib/data-fetching";

import dynamic from "next/dynamic";

// Components
import TransactionList from "@/components/transactions/TransactionList";
import Searchbar from "@/components/transactions/Searchbar";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import { TransactionsHeader } from "./_components/TransactionsHeader";
import { TransactionTableSkeleton } from "./_components/TransactionTableSkeleton";

// Dynamic Imports
const AddTransactionModal = dynamic(() =>
  import("@/components/transactions/AddTransactionModal")
);
const ImportOFXModal = dynamic(() =>
  import("@/components/transactions/ImportOFXModal")
);

interface TransactionsPageProps {
  searchParams: Promise<{
    q?: string;
    month?: string;
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    walletId?: string;
    page?: string;
  }>;
}

export default async function TransactionsPage(props: TransactionsPageProps) {
  const searchParams = await props.searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [categories, wallets] = await Promise.all([
    getCachedCategories(user.id),
    getCachedWallets(user.id),
  ]);

  // Filter searchParams to only include keys that affect the transaction list data.
  // This prevents the list from reloading (displaying skeleton) when modal state changes (mode, id).
  const { q, month, type, categoryId, walletId, page } = searchParams;
  const listParams = { q, month, type, categoryId, walletId, page };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Section */}
      <TransactionsHeader month={searchParams.month} />

      {/* Filtering & Search Block */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 w-full">
          <Searchbar />
        </div>
        <div className="w-full sm:w-auto">
          <TransactionFilters categories={categories} wallets={wallets} />
        </div>
      </div>

      <Suspense
        key={JSON.stringify(listParams)}
        fallback={<TransactionTableSkeleton />}
      >
        <TransactionList userId={user.id} searchParams={listParams} />
      </Suspense>

      <AddTransactionModal categories={categories} wallets={wallets} onOptimisticCreate={() => {}}/>
      <ImportOFXModal wallets={wallets} />
    </div>
  );
}
