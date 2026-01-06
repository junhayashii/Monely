"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowRightLeft, Wallet as WalletIcon } from "lucide-react";
import WalletCard from "./WalletCard";
import WalletForm from "./WalletForm";
import AddEditModal from "@/components/AddEditModal";
import DeleteDialog from "@/components/DeleteDialog";
import {
  deleteWallet,
  getWalletTransactions,
} from "@/app/(dashboard)/wallets/actions";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

function WalletList({ wallets }: { wallets: any[] }) {
  const { formatCurrency } = useCurrency();
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

  // カード4つ分の高さに固定（各カード176px + gap 16px = 192px、4つで768px）
  const fixedCardHeight = 4 * 192 - 16; // 752px

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左側: カードリスト（スクロール可能） */}
      <div
        className="lg:col-span-1 space-y-4 overflow-y-auto p-2"
        style={{ maxHeight: `${fixedCardHeight}px` }}
      >
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

      {/* 右側: トランザクションリスト（高さ固定） */}
      <div className="lg:col-span-2">
        <Card
          className="glass-card flex flex-col"
          style={{ height: `${fixedCardHeight}px` }}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">
                {selectedWallet
                  ? `${selectedWallet.name} - Transactions`
                  : "Transactions"}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {selectedWallet
                  ? isLoadingTransactions
                    ? "Loading transactions..."
                    : `${transactions.length} transaction${
                        transactions.length !== 1 ? "s" : ""
                      } found`
                  : "Select a wallet to view transactions"}
              </CardDescription>
            </div>
            {selectedWallet && transactions.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/transactions">View All</a>
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0 flex-1 overflow-y-auto min-h-0">
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
              <div className="space-y-1.5">
                {transactions.slice(0, 10).map((t) => {
                  const isTransfer = !!t.toWalletId;
                  const isIncome = t.category?.type === "INCOME";

                  const typeLabel = isTransfer
                    ? "Transfer"
                    : isIncome
                    ? "Income"
                    : "Expense";

                  const iconWrapperClasses = isTransfer
                    ? "bg-sky-100 text-sky-600 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30"
                    : isIncome
                    ? "bg-emerald-100 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                    : "bg-rose-100 text-rose-600 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30";

                  const pillClasses = isTransfer
                    ? "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30"
                    : isIncome
                    ? "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                    : "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30";

                  const amountClasses = isTransfer
                    ? "text-slate-900 dark:text-slate-50"
                    : isIncome
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-rose-600 dark:text-rose-300";

                  return (
                    <div
                      key={t.id}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors duration-200 hover:border-slate-200/80 hover:bg-white/60 dark:hover:border-slate-800/80 dark:hover:bg-slate-900/60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${iconWrapperClasses}`}
                        >
                          {isTransfer ? (
                            <ArrowRightLeft className="h-4 w-4" />
                          ) : (
                            <WalletIcon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                              {t.title}
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-tight ring-1 ring-inset ${pillClasses}`}
                            >
                              {typeLabel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.date), "MMM dd, yyyy")} •{" "}
                            {isTransfer
                              ? `${t.wallet?.name} ➔ ${t.toWallet?.name}`
                              : t.wallet?.name}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold tracking-tight ${amountClasses}`}
                      >
                        {!isTransfer && (isIncome ? "+" : "-")}{" "}
                        {formatCurrency(Math.abs(t.amount))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found for this wallet.
              </div>
            )}
          </CardContent>
        </Card>
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
