"use client";

import AddEditModal from "@/components/AddEditModal";
import TransactionForm from "./TransactionForm";
import DeleteDialog from "../DeleteDialog";
import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";
import { useSearchParams, useRouter } from "next/navigation";
import { Transaction, Category } from "@/lib/generated/prisma";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  transactions: Transaction[];
  categories: Category[];
};

const TransactionModalController = ({ transactions, categories }: Props) => {
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

  /* ---------- Add / Edit ---------- */
  if (isAdd || isEdit) {
    return (
      <AddEditModal
        title={isEdit ? "Edit Transaction" : "Add Transaction"}
        description={
          isEdit ? "Update your transaction" : "Create a new transaction"
        }
        open
        onOpenChange={() => router.push("/transactions")}
      >
        <TransactionForm
          editId={isEdit ? editId! : undefined}
          categories={categories}
          initialData={
            isEdit
              ? {
                  title: transactionToEdit.title,
                  amount: transactionToEdit.amount,
                  date: transactionToEdit.date.toISOString().slice(0, 10),
                  categoryId: transactionToEdit.categoryId,
                }
              : undefined
          }
          onCancel={() => router.push("/transactions")}
          onDelete={() => router.push(`?mode=delete&id=${editId}`)}
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
        const result = await deleteTransaction(editId!);

        if (result.success) {
          toast.success(result.message);
          // 成功したら一覧ページに戻る
          router.push("/transactions");
        } else {
          toast.error(result.message);
          // 失敗した場合はダイアログを閉じるか、開いたままにするか（今回は閉じる）
          router.push(`?mode=edit&id=${editId}`);
        }
      });
    };

    return (
      <DeleteDialog
        open
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction?"
        onCancel={() => router.push(`?mode=edit&id=${editId}`)}
        onConfirm={handleDeleteConfirm} // ★定義した関数を渡す
        isConfirming={isDeleting} // ★ローディング状態を渡す
      />
    );
  }

  return null;
};

export default TransactionModalController;
