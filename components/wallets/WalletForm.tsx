"use client";

import { useState, useTransition, useEffect } from "react";
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

  // 編集時にリセットされないよう、walletプロパティから初期値を設定
  const [name, setName] = useState(wallet?.name || "");
  const [type, setType] = useState(wallet?.type || "BANK");
  // クレジットカードの場合は表示用に正の数に変換
  const [initialBalance, setInitialBalance] = useState(
    wallet?.type === "CREDIT_CARD"
      ? Math.abs(wallet?.balance || 0)
      : wallet?.balance || 0
  );

  const [limit, setLimit] = useState(wallet?.limit ?? 0);
  const [closingDay, setClosingDay] = useState(wallet?.closingDay ?? "");
  const [paymentDay, setPaymentDay] = useState(wallet?.paymentDay ?? "");

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("initialBalance", initialBalance.toString());

    if (type === "CREDIT_CARD") {
      formData.append("limit", limit.toString());
      formData.append("closingDay", closingDay.toString());
      formData.append("paymentDay", paymentDay.toString());
    }

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
          placeholder="e.g. Rakuten Card, Main Bank"
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
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="balance">
          {type === "CREDIT_CARD" ? "現在の利用額 (未決済分)" : "初期残高"} (R$)
        </Label>
        <div className="relative">
          {type === "CREDIT_CARD" && (
            <span className="absolute left-3 top-2.5 text-muted-foreground">
              -
            </span>
          )}
          <Input
            id="balance"
            type="number"
            className={
              type === "CREDIT_CARD" ? "pl-6 text-rose-600 font-bold" : ""
            }
            value={initialBalance}
            onChange={(e) => setInitialBalance(Number(e.target.value))}
          />
        </div>
        {type === "CREDIT_CARD" && (
          <p className="text-[10px] text-rose-500 italic">
            *ここに入力した金額は「負債」として資産から差し引かれます
          </p>
        )}
      </div>

      {/* --- クレジットカード専用フィールド --- */}
      {type === "CREDIT_CARD" && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <Label htmlFor="limit">Credit Limit (限度額)</Label>
            <Input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              placeholder="500000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closingDay">締め日</Label>
              <Input
                id="closingDay"
                type="number"
                min="1"
                max="31"
                value={closingDay}
                onChange={(e) => setClosingDay(e.target.value)}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDay">支払日</Label>
              <Input
                id="paymentDay"
                type="number"
                min="1"
                max="31"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
        </div>
      )}

      <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Saving..." : "Save Wallet"}
      </Button>
    </div>
  );
}

export default WalletForm;
