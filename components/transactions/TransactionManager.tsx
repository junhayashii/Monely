"use client";

import { useOptimistic, useTransition, ReactNode } from "react";
import TransactionTable from "./TransactionTable";
import TransactionModalController from "./TransactionModalController";
import { Transaction, Category, Wallet } from "@/lib/generated/prisma";

type TransactionWithRelations = Transaction & {
  category?: { name: string; type: string } | null;
  wallet?: { name: string } | null;
  toWallet?: { name: string } | null;
};

type Props = {
  transactions: TransactionWithRelations[];
  categories: Category[];
  wallets: Wallet[];
  pagination?: ReactNode;
};

/**
 * TransactionManager - A client component that manages the transaction list state
 * with optimistic updates.
 */
export default function TransactionManager({
  transactions,
  categories,
  wallets,
  pagination,
}: Props) {
  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic<
    TransactionWithRelations[],
    { action: "update" | "delete"; transaction: Partial<TransactionWithRelations> }
  >(transactions, (state, { action, transaction }) => {
    if (action === "update") {
      return state.map((t) =>
        t.id === transaction.id ? { ...t, ...transaction } as any : t
      );
    }
    if (action === "delete") {
      return state.filter((t) => t.id !== transaction.id);
    }
    return state;
  });

  return (
    <>
      <TransactionTable data={optimisticTransactions as any} pagination={pagination} />
      <TransactionModalController
        transactions={optimisticTransactions as any}
        categories={categories}
        wallets={wallets}
        onOptimisticUpdate={(tx: TransactionWithRelations) =>
          addOptimisticTransaction({ action: "update", transaction: tx })
        }
        onOptimisticDelete={(id: string) =>
          addOptimisticTransaction({ action: "delete", transaction: { id } })
        }
      />
    </>
  );
}
