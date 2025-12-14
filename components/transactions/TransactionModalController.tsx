"use client";

import AddEditModal from "@/components/AddEditModal";
import TransactionForm from "./TransactionForm";
import { transactions } from "./data";
import { useSearchParams, useRouter } from "next/navigation";
import DeleteDialog from "../DeleteDialog";
import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";

const TransactionModalController = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode"); // "add" | "edit" | "delete"
  const editId = searchParams.get("id");

  const transactionToEdit = editId
    ? transactions.find((t) => t.id === editId)
    : undefined;

  const isAdd = mode === "add";
  const isEdit = mode === "edit" && !!transactionToEdit;
  const isDelete = mode === "delete" && !!transactionToEdit;
  const isOpen = isAdd || isEdit;

  return (
    <div>
      {isOpen && (
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
            onDelete={() => router.push(`?mode=delete&id=${editId}`)}
          />
        </AddEditModal>
      )}

      {isDelete && (
        <DeleteDialog
          open
          title="Delete Transaction"
          description="Are you sure you want to delete this transaction?"
          onCancel={() => router.push(`?mode=edit&id=${editId}`)}
          onConfirm={async () => {
            if (!editId) return;
            await deleteTransaction(editId);
            router.push("/transactions");
          }}
        />
      )}
    </div>
  );
};

export default TransactionModalController;
