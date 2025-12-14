import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import TransactionTable from "@/components/transactions/TransactionTable";

import { transactions } from "@/components/transactions/data";
import TransactionModalController from "@/components/transactions/TransactionModalController";

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
        {/* Add Button */}
        <AddTransactionButton />
      </div>
      {/* Table */}
      <TransactionTable data={transactions} />

      {/* Modal */}
      <TransactionModalController />
    </div>
  );
};

export default TransactionsPage;
