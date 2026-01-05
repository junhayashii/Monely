"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import WalletCard from "./WalletCard";
import WalletForm from "./WalletForm";
import AddEditModal from "@/components/AddEditModal";
import DeleteDialog from "@/components/DeleteDialog";
import TransactionTable from "@/components/transactions/TransactionTable";
import {
  deleteWallet,
  getWalletTransactions,
} from "@/app/(dashboard)/wallets/actions";
import { toast } from "sonner";

function WalletList({ wallets }: { wallets: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(
    wallets.length > 0 ? wallets[0] : null
  );
  const [selectedWalletForEdit, setSelectedWalletForEdit] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isPending, startTransition] = useTransition();

  // クエリパラメータからmode=addを監視
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "add" && !isModalOpen) {
      setSelectedWalletForEdit(null);
      setIsModalOpen(true);
    }
  }, [searchParams, isModalOpen]);

  // 選択されたウォレットのトランザクションを取得
  useEffect(() => {
    if (selectedWallet?.id) {
      setIsLoadingTransactions(true);
      getWalletTransactions(selectedWallet.id).then((result) => {
        if (result.success) {
          setTransactions(result.data);
        } else {
          setTransactions([]);
          toast.error("トランザクションの取得に失敗しました");
        }
        setIsLoadingTransactions(false);
      });
    } else {
      setTransactions([]);
    }
  }, [selectedWallet]);

  const handleSelect = (wallet: any) => {
    if (selectedWallet?.id === wallet.id) {
      // 同じカードをクリックしたら選択解除
      setSelectedWallet(null);
    } else {
      setSelectedWallet(wallet);
    }
  };

  const handleEdit = (wallet: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWalletForEdit(wallet);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // クエリパラメータをクリア
    router.push("/wallets");
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWallet(selectedWalletForEdit.id);
      if (result.success) {
        toast.success(result.message);
        setIsDeleteOpen(false);
        closeModal();
        // 削除されたウォレットが選択されていたら選択解除
        if (selectedWallet?.id === selectedWalletForEdit.id) {
          setSelectedWallet(null);
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* 左側: カードリスト */}
      <div className="lg:col-span-1 space-y-4">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            name={wallet.name}
            type={wallet.type}
            balance={wallet.balance}
            isSelected={selectedWallet?.id === wallet.id}
            onSelect={() => handleSelect(wallet)}
            onEdit={(e) => handleEdit(wallet, e)}
          />
        ))}
      </div>

      {/* 右側: トランザクションテーブル */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {selectedWallet
              ? `${selectedWallet.name} - Transactions`
              : "Transactions"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedWallet
              ? isLoadingTransactions
                ? "Loading transactions..."
                : `${transactions.length} transaction${
                    transactions.length !== 1 ? "s" : ""
                  } found`
              : "Select a wallet to view transactions"}
          </p>
        </div>

        {!selectedWallet ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">
              Select a wallet card to view its transactions
            </p>
          </div>
        ) : isLoadingTransactions ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : transactions.length > 0 ? (
          <TransactionTable data={transactions} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found for this wallet.
          </div>
        )}
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
        title={selectedWalletForEdit ? "Edit Wallet" : "Add New Wallet"}
        description="Set up your bank accounts, credit cards, or cash."
      >
        <WalletForm wallet={selectedWalletForEdit} onSuccess={closeModal} />
        {selectedWalletForEdit && (
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
        title={`Delete ${selectedWalletForEdit?.name}?`}
        description="Are you sure? This wallet will be removed. Transactions linked to this wallet might be affected."
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isConfirming={isPending}
      />
    </div>
  );
}

export default WalletList;
