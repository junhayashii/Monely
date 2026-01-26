"use client";

import AddEditModal from "@/components/AddEditModal";
import TransactionForm from "./TransactionForm";
import DeleteDialog from "../DeleteDialog";
import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";
import { useSearchParams, useRouter } from "next/navigation";
import { Category, Wallet } from "@/lib/generated/prisma";
import { useTransition } from "react";
import { toast } from "sonner";
import { TransactionWithRelations } from "@/lib/transactions/types";

type Props = {
  transactions: TransactionWithRelations[];
  categories: Category[];
  wallets: Wallet[];
  onOptimisticUpdate: (tx: TransactionWithRelations) => void;
  onOptimisticDelete: (id: string) => void;
};

export default function TransactionModalController({
  transactions,
  categories,
  wallets,
  onOptimisticUpdate,
  onOptimisticDelete,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();

  const mode = searchParams.get("mode"); // add | edit | delete
  const editId = searchParams.get("id");

  const transactionToEdit = transactions.find((t) => t.id === editId);

  // モード判定
  const isAdd = mode === "add";
  const isEdit = mode === "edit" && !!transactionToEdit;
  const isDelete = mode === "delete" && !!transactionToEdit;

  // ------------------------
  // URL更新用ヘルパー
  // ------------------------
  const pushUrl = (params?: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("mode");
    newParams.delete("id");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) newParams.set(key, value);
        else newParams.delete(key);
      });
    }
    router.push(`?${newParams.toString()}`);
  };

  // ------------------------
  // Delete Confirm
  // ------------------------
  const handleDeleteConfirm = () => {
    if (!editId) return;
    startDeleteTransition(async () => {
      onOptimisticDelete(editId);

      const result = await deleteTransaction(editId);

      if (result.success) {
        toast.success(result.message);
        pushUrl(); // 一覧に戻す
      } else {
        toast.error(result.message);
        pushUrl({ mode: "edit", id: editId }); // 失敗したら編集に戻す
      }
    });
  };

  // ------------------------
  // モード別レンダリング
  // ------------------------
  if (isEdit) {
    return (
      <AddEditModal
        title="Edit Transaction"
        description="Update your transaction"
        open
        onOpenChange={() => pushUrl()}
      >
        <TransactionForm
          editId={editId!}
          categories={categories}
          wallets={wallets}
          initialData={{
            title: transactionToEdit!.title,
            amount: transactionToEdit!.amount,
            date:
              transactionToEdit!.date instanceof Date
                ? transactionToEdit!.date.toISOString().slice(0, 10)
                : new Date(transactionToEdit!.date).toISOString().slice(0, 10),
            categoryId: transactionToEdit!.categoryId ?? "",
            walletId: transactionToEdit!.walletId ?? "",
            toWalletId: transactionToEdit!.toWalletId ?? "",
          }}
          onCancel={() => pushUrl()}
          onDelete={() => pushUrl({ mode: "delete", id: editId })}
          onOptimisticUpdate={onOptimisticUpdate}
        />
      </AddEditModal>
    );
  }

  if (isDelete) {
    return (
      <DeleteDialog
        open
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction?"
        onCancel={() => pushUrl({ mode: "edit", id: editId! })}
        onConfirm={handleDeleteConfirm}
        isConfirming={isDeleting}
      />
    );
  }

  return null;
}
