import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModalController from "@/components/transactions/TransactionModalController";
import { prisma } from "@/lib/prisma";
import Searchbar from "@/components/transactions/Searchbar";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import MonthPicker from "@/components/MonthPicker";

const TransactionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; month?: string }>;
}) => {
  const { q, month } = await searchParams;

  const where: any = {
    title: {
      contains: q || "",
      mode: "insensitive",
    },
  };

  if (month) {
    const referenceDate = parseISO(month);
    where.date = {
      gte: startOfMonth(referenceDate),
      lte: endOfMonth(referenceDate),
    };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      category: true,
    },
  });

  const categories = await prisma.category.findMany();

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
      </div>

      {/* Table */}
      <TransactionTable data={transactions} />

      {/* Modal */}
      <TransactionModalController
        transactions={transactions}
        categories={categories}
      />
    </div>
  );
};

export default TransactionsPage;
