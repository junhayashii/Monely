import TransactionManager from "./TransactionManager";
import TransactionPagination from "./TransactionPagination";
import { parseTransactionSearchParams } from "@/lib/transactions/parseSearchParams";
import { getTransactions } from "@/lib/transactions/data";
import { UISelectableCategory, UISelectableWallet } from "@/lib/transactions/types";

const PAGE_SIZE = 10;

interface TransactionListProps {
  userId: string;
  categories: UISelectableCategory[];
  wallets: UISelectableWallet[];
  searchParams: {
    q?: string;
    month?: string;
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    walletId?: string;
    page?: string;
  };
}

export default async function TransactionList({
  userId,
  categories,
  wallets,
  searchParams,
}: TransactionListProps) {
  const { q, month, type, categoryId, walletId, page } =
    parseTransactionSearchParams(searchParams);

  const { transactions, totalCount, totalPages } = await getTransactions({
    userId,
    q,
    month,
    type,
    categoryId,
    walletId,
    page,
    pageSize: PAGE_SIZE,
  });

  const skip = (page - 1) * PAGE_SIZE;

  return (
    <TransactionManager
      initialTransactions={transactions}
      categories={categories}
      wallets={wallets}
      pagination={
        totalPages > 1 ? (
          <TransactionPagination
            totalPages={totalPages}
            currentPage={page}
            skip={skip}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
          />
        ) : null
      }
    />
  );
}
