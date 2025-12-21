"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createTransaction,
  updateTransaction,
} from "@/app/(dashboard)/transactions/actions";

import { useState, useTransition } from "react";
import { toast } from "sonner"; // Sonnerをインポート
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import { useRouter } from "next/navigation"; // ページ遷移が必要なら使う

type TransactionFormProps = {
  initialData?: {
    title: string;
    amount: number;
    date: string; // date inputは "YYYY-MM-DD" 文字列を期待します
    categoryId: string | null;
    walletId?: string | null;
    toWalletId?: string | null;
  };
  categories: { id: string; name: string; type: string }[];
  wallets: { id: string; name: string; balance: number }[];
  editId?: string;
  onCancel: () => void;
  onDelete?: () => void;
};

const TransactionForm = ({
  initialData,
  editId,
  categories,
  wallets,
  onCancel,
  onDelete,
}: TransactionFormProps) => {
  // useTransitionでローディング状態(isPending)を管理
  const [isPending, startTransition] = useTransition();
  const [walletId, setWalletId] = useState<string | null>(
    initialData?.walletId || null
  );
  const [toWalletId, setToWalletId] = useState<string | null>(
    initialData?.toWalletId || null
  );

  const getInitialType = () => {
    if (initialData?.toWalletId) return "TRANSFER";
    const cat = categories.find((c) => c.id === initialData?.categoryId);
    return cat?.type === "INCOME" ? "INCOME" : "EXPENSE";
  };

  const [selectedType, setSelectedType] = useState<string>(getInitialType());

  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedType
  );

  // 削除ボタンのローディング用（もし必要なら分ける）
  const [isDeleting, setIsDeleting] = useState(false);

  // const router = useRouter(); // ページ遷移する場合

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // ブラウザの標準送信を無効化
    const formData = new FormData(event.currentTarget);

    console.log("walletId in formData:", formData.get("walletId"));

    startTransition(async () => {
      // IDがあるかどうかでActionを切り替え
      const result = editId
        ? await updateTransaction(editId, formData)
        : await createTransaction(formData);

      if (result.success) {
        toast.success(result.message);
        onCancel(); // 成功したらフォーム（モーダル）を閉じる
        // ページ遷移が必要なら: router.push("/transactions");
      } else {
        toast.error(result.message);
      }
    });
  };

  // 削除ボタンの処理もここでラップするとToastが出せます
  const handleDelete = async () => {
    if (!onDelete) return;

    // もしonDeleteの中でServer Actionを呼んでいるなら、
    // 親から関数を受け取るのではなく、ここでActionを呼ぶ設計の方が
    // Toast管理は楽かもしれません。現状は親に任せる形にしておきます。
    setIsDeleting(true);
    try {
      await onDelete();
      // 親側でToastを出していないならここで出す
      // toast.success("Deleted!");
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex w-full p-1 bg-muted rounded-lg">
        {["EXPENSE", "INCOME", "TRANSFER"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              selectedType === type
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Input
        name="title"
        defaultValue={initialData?.title}
        placeholder="Title"
        required
        disabled={isPending}
      />

      <Input
        name="amount"
        defaultValue={initialData?.amount}
        type="number"
        placeholder="Amount"
        required
        disabled={isPending}
      />

      <Input
        name="date"
        defaultValue={initialData?.date}
        type="date"
        required
        disabled={isPending}
      />

      {/* 2. 条件付き表示：カテゴリ（振替以外で表示） */}
      {selectedType !== "TRANSFER" && (
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            name="categoryId"
            required
            className="w-full p-2 border rounded-md bg-background text-sm"
            key={selectedType}
            defaultValue={initialData?.categoryId || ""}
          >
            <option value="" disabled>
              Select Category
            </option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3. 出金元 Wallet（振替の時は "From Wallet" と表示） */}
      <div className="space-y-2">
        <Label>{selectedType === "TRANSFER" ? "From Wallet" : "Wallet"}</Label>
        <input type="hidden" name="walletId" value={walletId || ""} />
        <Select
          value={walletId || ""}
          onValueChange={(value) => setWalletId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a wallet" />
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

      {/* 4. 振替先 Wallet（振替の時だけ表示） */}
      {selectedType === "TRANSFER" && (
        <div className="space-y-2">
          <Label>To Wallet</Label>
          <input type="hidden" name="toWalletId" value={toWalletId || ""} />
          <Select
            value={toWalletId || ""}
            onValueChange={(value) => setToWalletId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destination wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets
                .filter((w) => w.id !== walletId) // 出金元と同じ財布は選べないようにする
                .map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex items-center justify-between pt-4">
        {editId && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isPending || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Processing..." : editId ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TransactionForm;
