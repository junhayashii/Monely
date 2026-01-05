"use client";

import { addSavings } from "@/app/(dashboard)/goals/actions";
import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";

const AddSavingsForm = ({
  goal,
  wallets,
  onSuccess,
}: {
  goal: any;
  wallets: any[];
  onSuccess: () => void;
}) => {
  const { formatCurrency } = useCurrency();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState<number>(0);
  const [walletId, setWalletId] = useState<string>("");

  const handleSubmit = () => {
    if (amount <= 0) return toast.error("Please enter a valid amount");
    if (!walletId) return toast.error("Please select a wallet");

    startTransition(async () => {
      const result = await addSavings(goal.id, amount, walletId);
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
        <Label>From Wallet</Label>
        <Select onValueChange={setWalletId} value={walletId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                {wallet.name} ({formatCurrency(wallet.balance)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Amount to Save</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="0"
        />
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Processing..." : "Confirm Savings"}
      </Button>
    </div>
  );
};

export default AddSavingsForm;
