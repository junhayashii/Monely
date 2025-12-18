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
import { upsertWallet } from "@/app/(dashboard)/wallets/actions";

interface WalletFormProps {
  wallet?: any;
  onSuccess: () => void;
}

function WalletForm({ wallet, onSuccess }: WalletFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(wallet?.name || "");
  const [type, setType] = useState(wallet?.type || "BANK");
  const [initialBalance, setInitialBalance] = useState(wallet?.balance || 0);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("initialBalance", initialBalance.toString());

    startTransition(async () => {
      const result = await upsertWallet(wallet?.id, formData);
      if (result.success) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Wallet Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Main Bank, Cash"
        />
      </div>
      <div className="space-y-2">
        <Label>Wallet Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BANK">Bank Account</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
            <SelectItem value="E_MONEY">E-Money / Digital Wallet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance">Initial Balance (R$)</Label>
        <Input
          id="balance"
          type="number"
          value={initialBalance}
          onChange={(e) => setInitialBalance(Number(e.target.value))}
        />
      </div>
      <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Saving..." : "Save Wallet"}
      </Button>
    </div>
  );
}

export default WalletForm;
