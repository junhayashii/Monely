import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionTable from "@/components/transactions/TransactionTable";
import TransactionModalController from "@/components/transactions/TransactionModalController";
import { prisma } from "@/lib/prisma";
import Searchbar from "@/components/transactions/Searchbar";

const TransactionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const { q } = await searchParams;

  const transactions = await prisma.transaction.findMany({
    where: {
      title: {
        contains: q || "",
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
  });

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
      <Searchbar />
      {/* Table */}
      <TransactionTable data={transactions} />

      {/* Modal */}
      <TransactionModalController transactions={transactions} />
    </div>
  );
};

export default TransactionsPage;
