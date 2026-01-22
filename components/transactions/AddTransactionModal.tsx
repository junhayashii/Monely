"use client";

import AddEditModal from "@/components/AddEditModal";
import TransactionForm from "./TransactionForm";
import { useSearchParams, useRouter } from "next/navigation";
import { Category, Wallet } from "@/lib/generated/prisma";

type Props = {
  categories: Category[];
  wallets: Wallet[];
};

const AddTransactionModal = ({ categories, wallets }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode");
  const isAdd = mode === "add";

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("id");
    router.push(`?${params.toString()}`);
  };

  if (!isAdd) return null;

  return (
    <AddEditModal
      title="Add Transaction"
      description="Create a new transaction"
      open
      onOpenChange={close}
    >
      <TransactionForm
        categories={categories}
        wallets={wallets}
        onCancel={close}
      />
    </AddEditModal>
  );
};

export default AddTransactionModal;
