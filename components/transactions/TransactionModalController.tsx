"use client";

import AddEditModal from "@/components/AddEditModal";
import TransactionForm from "./TransactionForm";
import DeleteDialog from "../DeleteDialog";
import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";
import { useSearchParams, useRouter } from "next/navigation";
import { Transaction } from "@/lib/generated/prisma";

type Props = {
  transactions: Transaction[];
};

const TransactionModalController = ({ transactions }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

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
          initialData={
            isEdit
              ? {
                  title: transactionToEdit.title,
                  amount: transactionToEdit.amount,
                  date: transactionToEdit.date.toISOString().slice(0, 10),
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
    return (
      <DeleteDialog
        open
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction?"
        onCancel={() => router.push(`?mode=edit&id=${editId}`)}
        onConfirm={async () => {
          await deleteTransaction(editId!);
          router.push("/transactions");
        }}
      />
    );
  }

  return null;
};

export default TransactionModalController;
