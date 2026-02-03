"use client";

import TransactionTable from "./TransactionTable";
import TransactionModalController from "./TransactionModalController";
import { useOptimisticTransactions } from "./useOptimisticTransactions";
import {
  TransactionManagerProps,
  TransactionWithRelations,
} from "@/lib/transactions/types";

import AddTransactionModal from "./AddTransactionModal";

export default function TransactionManager({
  initialTransactions,
  categories,
  wallets,
  pagination,
}: TransactionManagerProps) {
  const [transactions, dispatch] =
    useOptimisticTransactions(initialTransactions);

  const handleOptimisticUpdate = (tx: TransactionWithRelations) =>
    dispatch({ type: "update", transaction: tx });

  const handleOptimisticDelete = (id: string) =>
    dispatch({ type: "delete", id });

  const handleOptimisticCreate = (tx: TransactionWithRelations) =>
    dispatch({ type: "create", transaction: tx });

  const handleSuccessCreate = (tempId: string, serverTx: TransactionWithRelations) => {
    dispatch({ type: "delete", id: tempId });
    dispatch({ type: "create", transaction: serverTx });
  };

  return (
    <>
      <TransactionTable data={transactions} pagination={pagination} />
      <TransactionModalController
        transactions={transactions}
        categories={categories}
        wallets={wallets}
        onOptimisticUpdate={handleOptimisticUpdate}
        onOptimisticDelete={handleOptimisticDelete}
      />
      <AddTransactionModal
        categories={categories}
        wallets={wallets}
        onOptimisticCreate={handleOptimisticCreate}
        onSuccessCreate={handleSuccessCreate}
      />
    </>
  );
}
