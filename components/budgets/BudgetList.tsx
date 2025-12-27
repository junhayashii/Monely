"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import BudgetCard from "@/components/budgets/BudgetCard";
import AddEditModal from "@/components/AddEditModal";
import DeleteDialog from "@/components/DeleteDialog";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/(dashboard)/budgets/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Category {
  id: string;
  name: string;
  budget: number | null;
  type: "EXPENSE" | "INCOME";
}

interface BudgetListProps {
  categories: Category[];
  spentMap: Record<string, number>;
}

function BudgetList({ categories, spentMap }: BudgetListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const [name, setName] = useState("");
  const [budget, setBudget] = useState(0);
  const [type, setType] = useState("EXPENSE");

  // クエリパラメータからmodeとidを監視
  const mode = searchParams.get("mode");
  const editId = searchParams.get("id");
  const typeParam = searchParams.get("type");

  // モーダルの状態を計算
  const categoryToEdit = editId
    ? categories.find((c) => c.id === editId)
    : undefined;

  const categoryForDelete =
    editId && mode === "delete"
      ? categories.find((c) => c.id === editId)
      : null;

  const isAdd = mode === "add";
  const isEdit = mode === "edit" && !!categoryToEdit;
  const isDelete = mode === "delete" && !!categoryForDelete;

  // モーダルが開いているかどうかを計算
  const shouldOpenModal = isAdd || isEdit;
  const shouldOpenDelete = isDelete;

  // モーダル用の状態を更新
  useEffect(() => {
    if (isAdd) {
      setSelectedCategory(null);
      setName("");
      setBudget(0);
      setType(typeParam === "INCOME" ? "INCOME" : "EXPENSE");
    } else if (isEdit && categoryToEdit) {
      setSelectedCategory(categoryToEdit);
      setName(categoryToEdit.name);
      setBudget(categoryToEdit.budget || 0);
      setType(categoryToEdit.type);
    }
  }, [isAdd, isEdit, categoryToEdit, typeParam]);

  useEffect(() => {
    setIsModalOpen(shouldOpenModal);
  }, [shouldOpenModal]);

  useEffect(() => {
    if (isDelete && categoryForDelete) {
      setCategoryToDelete(categoryForDelete);
    } else {
      setCategoryToDelete(null);
    }
    setIsDeleteOpen(shouldOpenDelete);
  }, [isDelete, categoryForDelete, shouldOpenDelete]);

  const closeModal = () => {
    // クエリパラメータをクリア
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("id");
    params.delete("type");
    router.push(`/budgets?${params.toString()}`);
  };

  const handleSave = async () => {
    // FormDataを組み立てる
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    // Incomeの場合はbudgetを0またはnullにする
    formData.append("budget", type === "INCOME" ? "0" : budget.toString());

    startTransition(async () => {
      let result;
      if (selectedCategory) {
        result = await updateCategory(selectedCategory.id, formData);
      } else {
        result = await createCategory(formData);
      }

      if (result.success) {
        toast.success(result.message); // ★ 成功！
        closeModal();
      } else {
        toast.error(result.message); // ★ 失敗を通知
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    startTransition(async () => {
      const result = await deleteCategory(categoryToDelete.id);
      if (result.success) {
        toast.success(result.message);
        // 成功したら一覧ページに戻る
        router.push("/budgets");
      } else {
        toast.error(result.message);
        // 失敗した場合は編集ページに戻る
        const editId = searchParams.get("id");
        if (editId) {
          router.push(`/budgets?mode=edit&id=${editId}`);
        }
      }
    });
  };
  return (
    <div className="space-y-8">
      <Tabs defaultValue="expense" className="w-full">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-2 mb-6">
          <h3 className="text-xl font-bold dark:text-white">
            Category Budgets
          </h3>
          <TabsList className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <TabsTrigger
              value="expense"
              className="px-6 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 data-[state=active]:shadow-sm"
            >
              Expense Budgets
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className="px-6 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 data-[state=active]:shadow-sm"
            >
              Income
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="expense" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories
              .filter((c) => c.type === "EXPENSE")
              .map((cat) => (
                <BudgetCard
                  key={cat.id}
                  name={cat.name}
                  spent={spentMap[cat.id] || 0}
                  budget={cat.budget || 0}
                  onClick={() => router.push(`/budgets?categoryId=${cat.id}`)}
                  onEdit={() => router.push(`/budgets?mode=edit&id=${cat.id}`)}
                />
              ))}
            {categories.filter((c) => c.type === "EXPENSE").length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No expense budgets yet. Click &quot;Add Budget&quot; to create
                one.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="income" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories
              .filter((c) => c.type === "INCOME")
              .map((cat) => (
                <BudgetCard
                  key={cat.id}
                  name={cat.name}
                  spent={spentMap[cat.id] || 0}
                  budget={cat.budget || 0}
                  type="INCOME"
                  onClick={() => router.push(`/budgets?categoryId=${cat.id}`)}
                  onEdit={() => router.push(`/budgets?mode=edit&id=${cat.id}`)}
                />
              ))}
            {categories.filter((c) => c.type === "INCOME").length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No income categories yet. Click &quot;Add Budget&quot; to create
                one.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ★ ここで AddEditModal を使用 */}
      <AddEditModal
        title={selectedCategory ? "Edit Category" : "Add New Category"}
        description={
          type === "INCOME"
            ? "Set your income category name."
            : "Set your category name and monthly target amount."
        }
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Food, Rent, etc."
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "EXPENSE" && (
            <div className="space-y-2">
              <Label>Amount (Target/Budget)</Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </div>
          )}

          <div className="flex justify-between pt-4">
            {selectedCategory && (
              <Button
                variant="destructive"
                onClick={() => {
                  router.push(`/budgets?mode=delete&id=${selectedCategory.id}`);
                }}
              >
                Delete
              </Button>
            )}
            <Button className="ml-auto" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </AddEditModal>

      <DeleteDialog
        open={isDeleteOpen}
        title={`Delete "${categoryToDelete?.name}"?`}
        description="This will permanently delete this category and all related transaction history. This action cannot be undone."
        onCancel={() => {
          const editId = searchParams.get("id");
          if (editId) {
            router.push(`/budgets?mode=edit&id=${editId}`);
          } else {
            router.push("/budgets");
          }
        }}
        onConfirm={handleConfirmDelete}
        isConfirming={isPending}
      />
    </div>
  );
}

export default BudgetList;
