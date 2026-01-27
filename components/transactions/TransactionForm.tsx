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
import {
  UISelectableCategory,
  UISelectableWallet,
} from "@/lib/transactions/types";

type TransactionFormProps = {
  initialData?: {
    title: string;
    amount: number;
    date: string; // date inputは "YYYY-MM-DD" 文字列を期待します
    categoryId: string | null;
    walletId?: string | null;
    toWalletId?: string | null;
  };
  categories: UISelectableCategory[];
  wallets: UISelectableWallet[];
  editId?: string;
  onCancel: () => void;
  onDelete?: () => void;
  onOptimisticUpdate?: (tx: any) => void;
};

const TransactionForm = ({
  initialData,
  editId,
  categories,
  wallets,
  onCancel,
  onDelete,
  onOptimisticUpdate,
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
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // ★重要: TRANSFER の時は categoryId を明示的に空にする
    if (selectedType === "TRANSFER") {
      formData.set("categoryId", "");
    } else {
      // 逆に TRANSFER 以外なら toWalletId を空にする
      formData.set("toWalletId", "");
    }

    let optimisticTransaction: any = null;

    if (onOptimisticUpdate) {
      const category = categories.find(
        (c) => c.id === formData.get("categoryId")
      );
      const wallet = wallets.find((w) => w.id === formData.get("walletId"));
      const toWallet = wallets.find((w) => w.id === formData.get("toWalletId"));

      optimisticTransaction = {
        id: editId || `temp-${Date.now()}`, // Temporary ID for new items
        title: formData.get("title") as string,
        amount: Number(formData.get("amount")),
        date: new Date(formData.get("date") as string),
        categoryId: formData.get("categoryId") as string,
        walletId: formData.get("walletId") as string,
        toWalletId: formData.get("toWalletId") as string,
        category,
        wallet,
        toWallet,
      };
    }

    startTransition(async () => {
      if (optimisticTransaction && onOptimisticUpdate) {
        onOptimisticUpdate(optimisticTransaction);
      }

      const result = editId
        ? await updateTransaction(editId, formData)
        : await createTransaction(formData);

      if (result.success) {
        toast.success(result.message);
        onCancel();
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
      {/* 1. タブ部分 (変更なし) */}
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
            {type === "EXPENSE" ? "支出" : type === "INCOME" ? "収入" : "振替"}
          </button>
        ))}
      </div>

      {/* 2. 基本項目 (変更なし) */}
      <Input
        name="title"
        defaultValue={initialData?.title}
        placeholder="タイトル"
        required
        disabled={isPending}
      />
      <Input
        name="amount"
        defaultValue={initialData?.amount}
        type="number"
        placeholder="金額"
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

      {/* 3. 条件付き表示：カテゴリ */}
      {selectedType !== "TRANSFER" ? (
        <div className="space-y-2">
          <Label>カテゴリ</Label>
          <select
            name="categoryId"
            required
            className="w-full p-2 border rounded-md bg-background text-sm"
            key={selectedType}
            defaultValue={initialData?.categoryId || ""}
          >
            <option value="" disabled>
              カテゴリを選択
            </option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        /* TRANSFER の時は隠しフィールドで categoryId を null 送信する */
        <input type="hidden" name="categoryId" value="" />
      )}

      {/* 4. 出金元 Wallet */}
      <div className="space-y-2">
        <Label>{selectedType === "TRANSFER" ? "振替元" : "使用する財布"}</Label>
        {/* name 属性を持たせることで FormData に含まれるようにします */}
        <input type="hidden" name="walletId" value={walletId || ""} />
        <Select value={walletId || ""} onValueChange={setWalletId}>
          <SelectTrigger>
            <SelectValue placeholder="財布を選択" />
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

      {/* 5. 振替先 Wallet */}
      {selectedType === "TRANSFER" && (
        <div className="space-y-2">
          <Label>振替先</Label>
          <input type="hidden" name="toWalletId" value={toWalletId || ""} />
          <Select value={toWalletId || ""} onValueChange={setToWalletId}>
            <SelectTrigger>
              <SelectValue placeholder="振替先の財布を選択" />
            </SelectTrigger>
            <SelectContent>
              {wallets
                .filter((w) => w.id !== walletId)
                .map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 6. ボタン部分 (変更なし) */}
      <div className="flex items-center justify-between pt-4">
        {/* 編集モード（editIdがある）かつ 削除関数がある場合のみ削除ボタンを表示 */}
        {editId && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || isDeleting}
          >
            {isDeleting ? "削除中..." : "削除"}
          </Button>
        )}

        <div className="flex gap-2 ml-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "処理中..." : editId ? "更新する" : "追加する"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TransactionForm;
