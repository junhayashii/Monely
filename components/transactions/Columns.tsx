"use client";

import { cn } from "@/lib/utils";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/lib/generated/prisma";
import { format, parseISO } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

type TransactionWithRelations = Transaction & {
  category?: { name: string; type: string; color?: string } | null;
  wallet?: { name: string } | null;
  toWallet?: { name: string } | null;
  toWalletId?: string | null;
};

/**
 * useColumns - TanStack Table Column Definitions
 *
 * This hook defines how each column of the transaction table is rendered.
 * It includes custom logic for:
 * - Dynamic icons based on transaction type.
 * - Responsive visibility (some columns hidden on mobile).
 * - Multi-wallet display for transfers.
 * - Currency formatting and semantic color coding (emerald for income, rose for expense).
 */
export function useColumns(): ColumnDef<Transaction>[] {
  const { formatCurrency } = useCurrency();

  return [
    {
      accessorKey: "title",
      header: "Transaction",
      cell: ({ row }) => {
        const name = row.getValue("title") as string;
        const tx = row.original as TransactionWithRelations;
        const isTransfer = !!tx.toWalletId;
        const isIncome = tx.category?.type === "INCOME";
        const categoryColor =
          tx.category?.color || (isIncome ? "#10b981" : "#64748b");

        return (
          <div className="flex items-center gap-3 md:gap-4 min-w-[140px] md:min-w-0">
            {/* 1. Transaction Type Icon */}
            <div
              // className は1つにまとめ、動的なクラスは cn() の中に入れます
              className={cn(
                "p-2 md:p-3 rounded-xl md:rounded-2xl shrink-0",
                isTransfer &&
                  "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
              )}
              style={{
                // 振替（Transfer）でない時だけ、カテゴリの色を適用する
                backgroundColor: !isTransfer ? `${categoryColor}15` : undefined,
                color: !isTransfer ? categoryColor : undefined,
              }}
            >
              {/* アイコン部分 */}
              {isTransfer ? (
                <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              ) : isIncome ? (
                <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              )}
            </div>
            {/* 2. Title and Mobile Subtext */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200 truncate">
                {name}
              </span>
              <span
                className="text-[10px] md:hidden font-bold uppercase tracking-tighter"
                style={{ color: isTransfer ? "#0ea5e9" : categoryColor }}
              >
                {tx.category?.name || (isTransfer ? "Transfer" : "None")}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => <span className="hidden md:inline">Category</span>,
      cell: ({ row }) => {
        const tx = row.original as TransactionWithRelations;
        const isTransfer = !!tx.toWalletId;
        const categoryName = tx.category?.name || "None";
        const categoryColor = tx.category?.color || "#64748b";

        if (isTransfer) {
          return (
            <div className="hidden md:block">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-xl">
                Transfer
              </span>
            </div>
          );
        }

        return (
          <div className="hidden md:block">
            {/* ★ カテゴリバッジに色を適用 */}
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-xl border"
              style={{
                backgroundColor: `${categoryColor}10`,
                color: categoryColor,
                borderColor: `${categoryColor}30`,
              }}
            >
              {categoryName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "wallet",
      header: () => <span className="hidden md:inline">Wallet</span>,
      cell: ({ row }) => {
        const tx = row.original as TransactionWithRelations;
        const fromWallet = tx.wallet?.name || "None";
        const toWallet = tx.toWallet?.name;
        const isTransfer = !!tx.toWalletId;

        // For transfers, we show both the source and destination wallets
        if (isTransfer) {
          return (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
                {fromWallet}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs">
                →
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-xl">
                {toWallet}
              </span>
            </div>
          );
        }

        return (
          <div className="hidden md:block">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
              {fromWallet}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const dateValue = row.getValue("date");
        const date =
          dateValue instanceof Date ? dateValue : parseISO(dateValue as string);
        return (
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-60" />
            {format(date, "MMM d")}
            <span className="hidden md:inline">, {format(date, "yyyy")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        const tx = row.original as TransactionWithRelations;
        const isTransfer = !!tx.toWalletId;
        const isIncome = tx.category?.type === "INCOME";

        const formatted = formatCurrency(Math.abs(amount));

        // Use semantic colors for positive/negative transactions
        const amountClasses = isTransfer
          ? "text-slate-900 dark:text-white"
          : isIncome
          ? "text-emerald-500 font-bold"
          : "text-slate-900 dark:text-white font-bold";

        return (
          <div className={`text-right text-sm md:text-base ${amountClasses}`}>
            {!isTransfer && isIncome ? "+" : ""}
            {formatted}
          </div>
        );
      },
    },
  ];
}
