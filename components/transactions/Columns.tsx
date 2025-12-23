"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/lib/generated/prisma";
import { format, parseISO } from "date-fns";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const name = row.getValue("title") as string;
      return <span className="font-medium">{name}</span>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const tx = row.original as any;
      const isTransfer = !!tx.toWalletId;
      const isIncome = tx.category?.type === "INCOME";
      
      const formatted = amount.toLocaleString("ja-JP", {
        style: "currency",
        currency: "JPY",
      });
      
      const amountClasses = isTransfer
        ? "text-slate-900 dark:text-slate-50 font-semibold"
        : isIncome
        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
        : "text-rose-600 dark:text-rose-400 font-semibold";
      
      return (
        <span className={amountClasses}>
          {!isTransfer && (isIncome ? "+" : "-")} {formatted}
        </span>
      );
    },
  },
  {
    accessorKey: "type", // 新しくタイプ列を作るか、Categoryを拡張
    header: "Type/Category",
    cell: ({ row }) => {
      const tx = row.original as any;
      const isTransfer = !!tx.toWalletId;
      const categoryName = tx.category?.name;
      const type = tx.category?.type; // INCOME or EXPENSE

      if (isTransfer) {
        return (
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-600 border-sky-200 ring-1 ring-inset ring-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30 dark:ring-sky-500/30"
          >
            Transfer
          </Badge>
        );
      }

      return (
        <Badge
          className={
            type === "INCOME"
              ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
              : "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30"
          }
          variant="secondary"
        >
          {categoryName || "None"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "wallet",
    header: "Wallet / Flow",
    cell: ({ row }) => {
      const tx = row.original as any;
      const fromWallet = tx.wallet?.name || "None";
      const toWallet = tx.toWallet?.name;

      return (
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 font-medium">
            {fromWallet}
          </span>
          {toWallet && (
            <>
              <span className="text-slate-400 dark:text-slate-500">➔</span>
              <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30 font-semibold">
                {toWallet}
              </span>
            </>
          )}
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
      return <span>{format(date, "MMM d, yyyy")}</span>;
    },
  },
];
