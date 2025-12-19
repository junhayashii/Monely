import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModalController from "@/components/transactions/TransactionModalController";
import { prisma } from "@/lib/prisma";
import Searchbar from "@/components/transactions/Searchbar";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import MonthPicker from "@/components/MonthPicker";
import TransactionFilters from "@/components/transactions/TransactionFilters";

const TransactionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    month?: string;
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    walletId?: string;
  }>;
}) => {
  const { q, month, type, categoryId, walletId } = await searchParams;

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

  const [transactions, categories, wallets] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: { category: true, wallet: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.wallet.findMany({ orderBy: { name: "asc" } }),
  ]);

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
