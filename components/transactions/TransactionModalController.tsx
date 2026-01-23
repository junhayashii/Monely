"use client";

import AddEditModal from "@/components/AddEditModal";
import TransactionForm from "./TransactionForm";
import DeleteDialog from "../DeleteDialog";
import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";
import { useSearchParams, useRouter } from "next/navigation";
import { Transaction, Category, Wallet } from "@/lib/generated/prisma";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  transactions: any[];
  categories: any[];
  wallets: any[];
  onOptimisticUpdate: (tx: any) => void;
  onOptimisticDelete: (id: string) => void;
};

const TransactionModalController = ({
  transactions,
  categories,
  wallets,
  onOptimisticUpdate,
  onOptimisticDelete,
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isDeleting, startDeleteTransition] = useTransition();

  const mode = searchParams.get("mode"); // add | edit | delete
  const editId = searchParams.get("id");

  const transactionToEdit = editId
    ? transactions.find((t) => t.id === editId)
    : undefined;

  const isAdd = mode === "add";
  const isEdit = mode === "edit" && !!transactionToEdit;
  const isDelete = mode === "delete" && !!transactionToEdit;

  // 検索パラメータを保持してURLを構築するヘルパー関数
  const buildUrl = (paramsToAdd?: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // modeとidを削除（これらはモーダル用のパラメータ）
    params.delete("mode");
    params.delete("id");
    
    // 追加のパラメータがあれば設定
    if (paramsToAdd) {
      Object.entries(paramsToAdd).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
    }
    
    return `?${params.toString()}`;
  };

  /* ---------- Edit ---------- */
  if (isEdit) {
    return (
      <AddEditModal
        title="Edit Transaction"
        description="Update your transaction"
        open
        onOpenChange={() => router.push(buildUrl())}
      >
        <TransactionForm
          editId={editId!}
          categories={categories}
          wallets={wallets}
          initialData={{
            title: transactionToEdit.title,
            amount: transactionToEdit.amount,
            date: transactionToEdit.date instanceof Date 
                ? transactionToEdit.date.toISOString().slice(0, 10)
                : new Date(transactionToEdit.date).toISOString().slice(0, 10),
            categoryId: transactionToEdit.categoryId ?? "",
            walletId: transactionToEdit.walletId ?? "",
            toWalletId: transactionToEdit.toWalletId,
          }}
          onCancel={() => router.push(buildUrl())}
          onDelete={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("mode", "delete");
            params.set("id", editId!);
            router.push(`?${params.toString()}`);
          }}
          onOptimisticUpdate={onOptimisticUpdate}
        />
      </AddEditModal>
    );
  }


  /* ---------- Delete ---------- */
  if (isDelete) {
    const handleDeleteConfirm = () => {
      if (!editId) return;

      // 削除トランジションを開始
      startDeleteTransition(async () => {
        onOptimisticDelete(editId);
        const result = await deleteTransaction(editId!);

        if (result.success) {
          toast.success(result.message);
          // 成功したら一覧ページに戻る（検索パラメータを保持）
          router.push(buildUrl());
        } else {
          toast.error(result.message);
          // 失敗した場合は編集モードに戻る（検索パラメータを保持）
          const params = new URLSearchParams(searchParams.toString());
          params.set("mode", "edit");
          params.set("id", editId);
          router.push(`?${params.toString()}`);
        }
      });
    };

    return (
      <DeleteDialog
        open
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction?"
        onCancel={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("mode", "edit");
          params.set("id", editId!);
          router.push(`?${params.toString()}`);
        }}
        onConfirm={handleDeleteConfirm} // ★定義した関数を渡す
        isConfirming={isDeleting} // ★ローディング状態を渡す
      />
    );
  }

  return null;
};

export default TransactionModalController;
