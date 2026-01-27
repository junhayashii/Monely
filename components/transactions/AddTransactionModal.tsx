"use client";

import AddEditModal from "@/components/AddEditModal";
import TransactionForm from "./TransactionForm";
import { useSearchParams, useRouter } from "next/navigation";
import { Category, Wallet } from "@/lib/generated/prisma";
import { CategoryType, WalletType } from "@/lib/generated/prisma";

export type UISelectableCategory = {
  id: string;
  name: string;
  type: CategoryType;
  color: string | null;
};

export type UISelectableWallet = {
  id: string;
  name: string;
  type: WalletType;
  color: string | null;
};

type Props = {
  categories: UISelectableCategory[];
  wallets: UISelectableWallet[];
  onOptimisticCreate: (tx: any) => void;
};

const AddTransactionModal = ({
  categories,
  wallets,
  onOptimisticCreate,
}: Props) => {
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
        onOptimisticUpdate={onOptimisticCreate}
      />
    </AddEditModal>
  );
};

export default AddTransactionModal;
