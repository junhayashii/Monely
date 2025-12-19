"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertRecurringBill } from "@/app/(dashboard)/recurring/actions";

interface RecurringFormProps {
  bill?: any;
  wallets: any[];
  categories: any[];
  onSuccess: () => void;
}

function RecurringForm({
  bill,
  wallets,
  categories,
  onSuccess,
}: RecurringFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(bill?.name || "");
  const [amount, setAmount] = useState(bill?.amount || 0);
  const [category, setCategory] = useState(bill?.category || "Subscription");
  const [frequency, setFrequency] = useState(bill?.frequency || "MONTHLY");
  const [startDate, setStartDate] = useState(
    bill?.startDate ? new Date(bill.startDate).toISOString().split("T")[0] : ""
  );
  const [walletId, setWalletId] = useState(bill?.walletId || "");
  const [categoryId, setCategoryId] = useState(bill?.categoryId || "");

  const handleSubmit = () => {
    if (!walletId) return toast.error("Please select a wallet");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("amount", amount.toString());
    formData.append("categoryId", categoryId);
    formData.append("frequency", frequency);
    formData.append("startDate", startDate);
    formData.append("walletId", walletId);

    startTransition(async () => {
      const result = await upsertRecurringBill(bill?.id, formData);
      if (result.success) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4 py-4 px-6">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Netflix, Rent, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Wallet (Source)</Label>
        <Select value={walletId} onValueChange={setWalletId}>
          <SelectTrigger>
            <SelectValue placeholder="Select wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Start Date</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Saving..." : "Save Recurring Bill"}
      </Button>
    </div>
  );
}

export default RecurringForm;
