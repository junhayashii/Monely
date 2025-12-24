"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import WalletCard from "./WalletCard";
import WalletForm from "./WalletForm";
import AddEditModal from "@/components/AddEditModal";
import DeleteDialog from "@/components/DeleteDialog";
import { deleteWallet } from "@/app/(dashboard)/wallets/actions";
import { toast } from "sonner";

function WalletList({ wallets }: { wallets: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // クエリパラメータからmode=addを監視
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "add" && !isModalOpen) {
      setSelectedWallet(null);
      setIsModalOpen(true);
    }
  }, [searchParams, isModalOpen]);

  const handleEdit = (wallet: any) => {
    setSelectedWallet(wallet);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // クエリパラメータをクリア
    router.push("/wallets");
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWallet(selectedWallet.id);
      if (result.success) {
        toast.success(result.message);
        setIsDeleteOpen(false);
        closeModal();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            name={wallet.name}
            type={wallet.type}
            balance={wallet.balance}
            onClick={() => handleEdit(wallet)}
          />
        ))}
      </div>

      {/* 編集・追加モーダル */}
      <AddEditModal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          } else {
            setIsModalOpen(true);
          }
        }}
        title={selectedWallet ? "Edit Wallet" : "Add New Wallet"}
        description="Set up your bank accounts, credit cards, or cash."
      >
        <WalletForm
          wallet={selectedWallet}
          onSuccess={closeModal}
        />
        {selectedWallet && (
          <div className="px-6 pb-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete Wallet
            </Button>
          </div>
        )}
      </AddEditModal>

      {/* 削除確認 */}
      <DeleteDialog
        open={isDeleteOpen}
        title={`Delete ${selectedWallet?.name}?`}
        description="Are you sure? This wallet will be removed. Transactions linked to this wallet might be affected."
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isConfirming={isPending}
      />
    </div>
  );
}

export default WalletList;
