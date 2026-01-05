"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AddEditModal from "@/components/AddEditModal";
import DeleteDialog from "@/components/DeleteDialog";
import GoalForm from "./GoalForm";
import { deleteGoal } from "@/app/(dashboard)/goals/actions";
import { toast } from "sonner";
import AddSavingsForm from "@/components/goals/AddSavingsForm";
import { useCurrency } from "@/contexts/CurrencyContext";

function GoalList({ goals, wallets }: { goals: any[]; wallets: any[] }) {
  const { formatCurrency } = useCurrency();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // クエリパラメータからmode=addを監視
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "add" && !isModalOpen) {
      setSelectedGoal(null);
      setIsModalOpen(true);
    }
  }, [searchParams, isModalOpen]);

  const handleEdit = (goal: any) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // クエリパラメータをクリア
    router.push("/goals");
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGoal(selectedGoal.id);
      if (result.success) {
        toast.success("Goal deleted successfully");
        setIsDeleteOpen(false);
        closeModal();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleAddSavings = (e: React.MouseEvent, goal: any) => {
    e.stopPropagation(); // カード自体のクリックイベント（編集）を阻止
    setSelectedGoal(goal);
    setIsSavingsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = Math.min(
            (goal.currentAmount / goal.targetAmount) * 100,
            100
          );
          return (
            <Card
              key={goal.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleEdit(goal)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {goal.name}
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(goal.currentAmount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {formatCurrency(goal.targetAmount)}
                </p>
                <div className="mt-4 space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{progress.toFixed(1)}%</span>
                    <span>
                      Remaining: {formatCurrency(
                        goal.targetAmount - goal.currentAmount
                      )}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary hover:text-white"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleAddSavings(e, goal)}
                >
                  Add Savings
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AddEditModal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          } else {
            setIsModalOpen(true);
          }
        }}
        title={selectedGoal ? "Edit Goal" : "Add New Goal"}
        description="Track your savings progress for something special."
      >
        <GoalForm goal={selectedGoal} onSuccess={closeModal} />
        {selectedGoal && (
          <div className="px-6 pb-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete Goal
            </Button>
          </div>
        )}
      </AddEditModal>

      {/* 入金用モーダル */}
      <AddEditModal
        open={isSavingsOpen}
        onOpenChange={setIsSavingsOpen}
        title="Add Savings"
        description={`How much do you want to save for ${selectedGoal?.name}?`}
      >
        <AddSavingsForm
          goal={selectedGoal}
          wallets={wallets}
          onSuccess={() => setIsSavingsOpen(false)}
        />
      </AddEditModal>

      <DeleteDialog
        open={isDeleteOpen}
        title={`Delete "${selectedGoal?.name}"?`}
        description="Are you sure? This goal will be removed. Your saved progress data will be lost."
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isConfirming={isPending}
      />
    </div>
  );
}

export default GoalList;
