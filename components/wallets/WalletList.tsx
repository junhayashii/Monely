"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletCard from "./WalletCard";
import WalletForm from "./WalletForm";
import AddEditModal from "@/components/AddEditModal";
import DeleteDialog from "@/components/DeleteDialog";
import { deleteWallet } from "@/app/(dashboard)/wallets/actions";
import { toast } from "sonner";

function WalletList({ wallets }: { wallets: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (wallet: any) => {
    setSelectedWallet(wallet);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedWallet(null);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWallet(selectedWallet.id);
      if (result.success) {
        toast.success(result.message);
        setIsDeleteOpen(false);
        setIsModalOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add New Wallet
        </Button>
      </div>

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
        onOpenChange={setIsModalOpen}
        title={selectedWallet ? "Edit Wallet" : "Add New Wallet"}
        description="Set up your bank accounts, credit cards, or cash."
      >
        <WalletForm
          wallet={selectedWallet}
          onSuccess={() => setIsModalOpen(false)}
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
