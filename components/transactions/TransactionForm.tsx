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
    categoryId: string;
    walletId?: string | null;
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

  const initialType =
    categories.find((c) => c.id === initialData?.categoryId)?.type === "INCOME"
      ? "INCOME"
      : "EXPENSE";

  const [selectedType, setSelectedType] = useState<string>("EXPENSE");

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
        <button
          type="button"
          onClick={() => setSelectedType("EXPENSE")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            selectedType === "EXPENSE"
              ? "bg-background shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setSelectedType("INCOME")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            selectedType === "INCOME"
              ? "bg-background shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Income
        </button>
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <select
          name="categoryId"
          required
          className="w-full p-2 border rounded-md bg-background"
          key={selectedType}
          defaultValue={initialData?.categoryId || ""}
        >
          <option value="" disabled>
            カテゴリを選択してください
          </option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Wallet</Label>

        {/* ★ ここが重要！ selectの外側ではなく、formの中であればどこでもOKですが、ここが一番分かりやすいです */}
        <input type="hidden" name="walletId" value={walletId || ""} />

        <Select
          value={walletId || ""}
          onValueChange={(value) => setWalletId(value)} // 確実にステートを更新
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((w: any) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        {/* Left Side: Delete */}
        {editId && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        )}

        {/* Right Side: Cancel & Save */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isPending}>
            {isPending
              ? editId
                ? "Saving..."
                : "Creating..."
              : editId
              ? "Update"
              : "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TransactionForm;
