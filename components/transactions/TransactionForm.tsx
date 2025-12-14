"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createTransaction,
  updateTransaction,
} from "@/app/(dashboard)/transactions/actions";

type TransactionFormProps = {
  initialData?: {
    title: string;
    amount: number;
    date: string;
  };
  editId?: string;
  onCancel: () => void;
  onDelete?: () => void;
};

const TransactionForm = ({
  initialData,
  editId,
  onCancel,
  onDelete,
}: TransactionFormProps) => {
  const action = editId
    ? updateTransaction.bind(null, editId)
    : createTransaction;

  return (
    <form action={action} className="space-y-4">
      <Input
        name="title"
        defaultValue={initialData?.title}
        placeholder="Title"
      />

      <Input
        name="amount"
        defaultValue={initialData?.amount}
        type="number"
        placeholder="Amount"
      />

      <Input name="date" defaultValue={initialData?.date} type="date" />

      <div className="flex items-center justify-between">
        {/* Left Side */}
        {editId && onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}

        {/* Right Side */}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{editId ? "Update" : "Create"}</Button>
        </div>
      </div>
    </form>
  );
};

export default TransactionForm;
