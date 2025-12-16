"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createTransaction,
  updateTransaction,
} from "@/app/(dashboard)/transactions/actions";

import { useState, useTransition } from "react";
import { toast } from "sonner"; // Sonnerをインポート
// import { useRouter } from "next/navigation"; // ページ遷移が必要なら使う

type TransactionFormProps = {
  initialData?: {
    title: string;
    amount: number;
    date: string; // date inputは "YYYY-MM-DD" 文字列を期待します
    categoryId: string;
  };
  categories: { id: string; name: string }[];
  editId?: string;
  onCancel: () => void;
  onDelete?: () => void;
};

const TransactionForm = ({
  initialData,
  editId,
  categories,
  onCancel,
  onDelete,
}: TransactionFormProps) => {
  // useTransitionでローディング状態(isPending)を管理
  const [isPending, startTransition] = useTransition();

  // 削除ボタンのローディング用（もし必要なら分ける）
  const [isDeleting, setIsDeleting] = useState(false);

  // const router = useRouter(); // ページ遷移する場合

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // ブラウザの標準送信を無効化
    const formData = new FormData(event.currentTarget);

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
          defaultValue={initialData?.categoryId || ""}
        >
          <option value="" disabled>
            カテゴリを選択してください
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
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
