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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all your financial transactions
            {month && ` • ${format(selectedMonth, "MMMM yyyy")}`}
          </p>
        </div>
        <div className="flex gap-3">
          <MonthPicker />
          <AddTransactionButton />
        </div>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Searchbar />
        </div>

        <TransactionFilters categories={categories} wallets={wallets} />
      </div>

      {/* Transactions Table Card */}
      <Card className="relative overflow-hidden border border-slate-200/70 bg-linear-to-br from-white via-slate-50 to-slate-100 shadow-sm dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full bg-linear-to-br from-sky-400/15 via-blue-500/8 to-transparent blur-3xl dark:from-sky-500/10 dark:via-blue-500/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">
                All Transactions
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {totalCount === 0
                  ? "No transactions found"
                  : `Showing ${skip + 1}-${Math.min(
                      skip + PAGE_SIZE,
                      totalCount
                    )} of ${totalCount} transactions`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <TransactionTable data={transactions} />
          {totalPages > 1 && (
            <div className="mt-6">
              <TransactionPagination
                totalPages={totalPages}
                currentPage={currentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

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
