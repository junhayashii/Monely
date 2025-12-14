import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionTable from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/button";

const TransactionsPage = () => {
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
        <AddTransactionButton />
      </div>
      {/* Table */}
      <TransactionTable />
    </div>
  );
};

export default TransactionsPage;
