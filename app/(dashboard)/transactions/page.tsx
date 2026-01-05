import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModalController from "@/components/transactions/TransactionModalController";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import Searchbar from "@/components/transactions/Searchbar";
import { startOfMonth, endOfMonth, parseISO, format } from "date-fns";
import MonthPicker from "@/components/MonthPicker";
import TransactionFilters from "@/components/transactions/TransactionFilters";
import TransactionPagination from "@/components/transactions/TransactionPagination";
import { createClient } from "@/lib/supabase";

const PAGE_SIZE = 10;

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
    // ログインしていなければリダイレクトなど
    return <div>Please log in.</div>;
  }

  const { q, month, type, categoryId, walletId, page } = await searchParams;

  const currentPage = Number(page) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where: Prisma.TransactionWhereInput = {
    userId: user.id,
  };

  // 検索クエリフィルタ
  if (q && q.trim()) {
    where.title = {
      contains: q.trim(),
      mode: "insensitive",
    };
  }

  // 月フィルタ
  if (month) {
    const referenceDate = parseISO(`${month}-01`);
    where.date = {
      gte: startOfMonth(referenceDate),
      lte: endOfMonth(referenceDate),
    };
  }

  // Type (Income/Expense) フィルタ
  if (type) {
    where.category = {
      type: type,
    };
  }

  // Category フィルタ
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Wallet フィルタ
  if (walletId) {
    where.walletId = walletId;
  }

  const [transactions, totalCount, categories, wallets] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: { category: true, wallet: true, toWallet: true },
      skip: skip,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.wallet.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
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
          <TransactionFilters categories={categories} wallets={wallets} />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionTable
        data={transactions}
        pagination={
          totalPages > 1 ? (
            <TransactionPagination
              totalPages={totalPages}
              currentPage={currentPage}
              skip={skip}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
            />
          ) : undefined
        }
      />

      {/* Modal */}
      <TransactionModalController
        transactions={transactions}
        categories={categories}
        wallets={wallets}
      />
    </div>
  );
};

export default TransactionsPage;
