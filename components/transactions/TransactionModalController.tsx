"use client";

import AddEditModal from "@/components/AddEditModal";
import TransactionForm from "./TransactionForm";
import { transactions } from "./data";
import { useSearchParams, useRouter } from "next/navigation";

const TransactionModalController = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode"); // "add" | "edit" | null
  const editId = searchParams.get("id");

  const transactionToEdit = editId
    ? transactions.find((t) => t.id === editId)
    : undefined;

  const isAdd = mode === "add";
  const isEdit = mode === "edit" && !!transactionToEdit;
  const isOpen = isAdd || isEdit;

  if (!isOpen) return null;

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
                title: transactionToEdit.name,
                amount: transactionToEdit.amount,
                date: transactionToEdit.date,
              }
            : undefined
        }
        onCancel={() => router.push("/transactions")}
      />
    </AddEditModal>
  );
};

export default TransactionModalController;
