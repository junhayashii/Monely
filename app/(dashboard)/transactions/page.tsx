import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModalController from "@/components/transactions/TransactionModalController";
import { prisma } from "@/lib/prisma";
import Searchbar from "@/components/transactions/Searchbar";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
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

  const where: any = {
    title: {
      contains: q || "",
      mode: "insensitive",
    },
  };

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
      where: { userId: user.id },
      orderBy: { date: "desc" },
      include: { category: true, wallet: true },
      skip: skip,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            See your transactions here
          </p>
        </div>
        {/* Add Button */}
        <AddTransactionButton />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Searchbar />
        <MonthPicker />
        <TransactionFilters categories={categories} wallets={wallets} />
      </div>

      {/* Table */}
      <TransactionTable data={transactions} />

      <div className="mt-4">
        <TransactionPagination
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </div>

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
