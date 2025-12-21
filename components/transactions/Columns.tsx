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
      // 日本円なら "JPY"、USDならそのままでOKです
      const formatted = amount.toLocaleString("ja-JP", {
        style: "currency",
        currency: "JPY",
      });
      return <span>{formatted}</span>;
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
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Transfer
          </Badge>
        );
      }

      return (
        <Badge
          className={
            type === "INCOME"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
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
        <div className="flex items-center gap-1 text-xs font-medium">
          <span className="px-2 py-1 rounded-full bg-secondary">
            {fromWallet}
          </span>
          {toWallet && (
            <>
              <span className="text-muted-foreground">➔</span>
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
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
