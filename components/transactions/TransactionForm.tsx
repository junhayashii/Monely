"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type TransactionFormValues = {
  title: string;
  amount: number;
  date: string;
};

type TransactionFormProps = {
  initialData?: TransactionFormValues;
  onSubmit: (values: TransactionFormValues) => void;
  onCancel: () => void;
};

const TransactionForm = ({
  initialData,
  onSubmit,
  onCancel,
}: TransactionFormProps) => {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [amount, setAmount] = useState(initialData?.amount ?? 0);
  const [date, setDate] = useState(initialData?.date ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, amount, date });
      }}
    >
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default TransactionForm;
