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
};

const TransactionForm = ({
  initialData,
  editId,
  onCancel,
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{editId ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
};

export default TransactionForm;
