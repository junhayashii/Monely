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

  // クエリパラメータからmode=addとtypeを監視
  useEffect(() => {
    const mode = searchParams.get("mode");
    const typeParam = searchParams.get("type");
    if (mode === "add" && !isModalOpen) {
      startTransition(() => {
        setSelectedCategory(null);
        setName("");
        setBudget(0);
        setType(typeParam === "INCOME" ? "INCOME" : "EXPENSE");
        setIsModalOpen(true);
      });
    }
  }, [searchParams, isModalOpen, startTransition]);

  const openModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setName(category.name);
      setBudget(category.budget || 0);
      setType(category.type);
    } else {
      setSelectedCategory(null);
      setName("");
      setBudget(0);
      setType("EXPENSE");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // クエリパラメータをクリア
    router.push("/budgets");
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
        setIsDeleteOpen(false);
        setIsModalOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };
  return (
    <div className="space-y-8">
      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expense">Expense Budgets</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((c) => c.type === "EXPENSE")
              .map((cat) => (
                <BudgetCard
                  key={cat.id}
                  name={cat.name}
                  spent={spentMap[cat.id] || 0}
                  budget={cat.budget || 0}
                  onClick={() => openModal(cat)}
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

        <TabsContent value="income" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((c) => c.type === "INCOME")
              .map((cat) => (
                <BudgetCard
                  key={cat.id}
                  name={cat.name}
                  spent={spentMap[cat.id] || 0}
                  budget={cat.budget || 0}
                  type="INCOME"
                  onClick={() => openModal(cat)}
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
          } else {
            setIsModalOpen(true);
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
                  setCategoryToDelete(selectedCategory);
                  setIsDeleteOpen(true);
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
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isConfirming={isPending}
      />
    </div>
  );
}

export default BudgetList;
