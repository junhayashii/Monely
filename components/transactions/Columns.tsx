"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/lib/generated/prisma";
import { format, parseISO } from "date-fns";

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
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original as any;
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary">
          {category.category?.name || "None"}
        </span>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const dateValue = row.getValue("date");

      const dateString =
        dateValue instanceof Date
          ? dateValue.toISOString().split("T")[0]
          : (dateValue as string).split("T")[0];

      const date = parseISO(dateString);

      return <span>{format(date, "MMM d, yyyy")}</span>;
    },
  },
];
