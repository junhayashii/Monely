"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/lib/generated/prisma";

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
      const formatted = amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date") as string);
      return (
        <span>
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
];
