"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  budget: number | null;
}

interface BudgetListProps {
  categories: Category[];
  spentMap: Record<string, number>;
}

function BudgetList({ categories, spentMap }: BudgetListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const [name, setName] = useState("");
  const [budget, setBudget] = useState(0);
  const [type, setType] = useState("EXPENSE");

  const openModal = (category?: any) => {
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

  const handleSave = async () => {
    // FormDataを組み立てる
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("budget", budget.toString());

    startTransition(async () => {
      let result;
      if (selectedCategory) {
        result = await updateCategory(selectedCategory.id, formData);
      } else {
        result = await createCategory(formData);
      }

      if (result.success) {
        toast.success(result.message); // ★ 成功！
        setIsModalOpen(false);
      } else {
        toast.error(result.message); // ★ 失敗を通知
      }
    });
  };

  const handleConfirmDelete = () => {
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
      <div className="flex justify-end">
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Add Budget Item
        </Button>
      </div>

      {/* セクション分け表示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Expense Budgets</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories
            .filter((c: any) => c.type === "EXPENSE")
            .map((cat: any) => (
              <BudgetCard
                key={cat.id}
                name={cat.name}
                spent={spentMap[cat.id] || 0}
                budget={cat.budget || 0}
                onClick={() => openModal(cat)}
              />
            ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Income Goals</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories
            .filter((c: any) => c.type === "INCOME")
            .map((cat: any) => (
              <BudgetCard
                key={cat.id}
                name={cat.name}
                spent={spentMap[cat.id] || 0}
                budget={cat.budget || 0}
                onClick={() => openModal(cat)}
              />
            ))}
        </div>
      </section>

      {/* ★ ここで AddEditModal を使用 */}
      <AddEditModal
        title={selectedCategory ? "Edit Category" : "Add New Category"}
        description="Set your category name and monthly target amount."
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
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
          <div className="space-y-2">
            <Label>Amount (Target/Budget)</Label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </div>

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
