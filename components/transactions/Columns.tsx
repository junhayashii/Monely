"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/lib/generated/prisma";
import { format, parseISO } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

type TransactionWithRelations = Transaction & {
  category?: { name: string; type: string } | null;
  wallet?: { name: string } | null;
  toWallet?: { name: string } | null;
  toWalletId?: string | null;
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "title",
    header: "Transaction",
    cell: ({ row }) => {
      const name = row.getValue("title") as string;
      const tx = row.original as TransactionWithRelations;
      const isTransfer = !!tx.toWalletId;
      const isIncome = tx.category?.type === "INCOME";

      return (
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${
              isTransfer
                ? "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"
                : isIncome
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
            }`}
          >
            {isTransfer ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : isIncome ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Category",
    cell: ({ row }) => {
      const tx = row.original as TransactionWithRelations;
      const isTransfer = !!tx.toWalletId;
      const categoryName = tx.category?.name || "None";

      if (isTransfer) {
        return (
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-xl">
            Transfer
          </span>
        );
      }

      return (
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
          {categoryName}
        </span>
      );
    },
  },
  {
    accessorKey: "wallet",
    header: "Wallet",
    cell: ({ row }) => {
      const tx = row.original as TransactionWithRelations;
      const fromWallet = tx.wallet?.name || "None";
      const toWallet = tx.toWallet?.name;
      const isTransfer = !!tx.toWalletId;

      if (isTransfer) {
        return (
          <div className="flex items-center gap-2">
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
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
          {fromWallet}
        </span>
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
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 opacity-60" />
          {format(date, "MMM d, yyyy")}
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

      const formatted = `¥${Math.abs(amount).toLocaleString("ja-JP")}`;

      const amountClasses = isTransfer
        ? "text-slate-900 dark:text-white"
        : isIncome
        ? "text-emerald-500"
        : "text-slate-900 dark:text-white";

      return (
        <div className={`text-right font-bold text-base ${amountClasses}`}>
          {!isTransfer && isIncome ? "+" : ""}
          {formatted}
        </div>
      );
    },
  },
];
