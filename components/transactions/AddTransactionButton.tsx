"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import AddEditModal from "../AddEditModal";
import TransactionForm from "./TransactionForm";

const AddTransactionButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("modal") === "add";
  return (
    <div>
      <Button onClick={() => router.push("?modal=add")}>Add Transaction</Button>

      <AddEditModal
        title="Add Transaction"
        description="Create a new transaction"
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) router.push("/transactions");
        }}
      >
        <TransactionForm onClose={() => router.push("/transactions")} />
      </AddEditModal>
    </div>
  );
};

export default AddTransactionButton;
