"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const getGoalColor = (index: number) => {
    const colors = [
      "bg-emerald-300",
      "bg-amber-300",
      "bg-sky-300",
      "bg-rose-300",
      "bg-indigo-300",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, idx) => {
          const progress = Math.min(
            (goal.currentAmount / goal.targetAmount) * 100,
            100
          );
          const goalColor = getGoalColor(idx);

          return (
            <div
              key={goal.id}
              className="glass-card p-6 rounded-3xl relative overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleEdit(goal)}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${goalColor} bg-opacity-20`}>
                  <Target
                    className={`w-5 h-5 ${goalColor.replace("bg-", "text-")}`}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {goal.name}
                  </h4>
                  {goal.deadline && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>
                        Until{" "}
                        {new Date(goal.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Saved
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(goal.currentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Target
                    </p>
                    <p className="text-sm font-semibold text-slate-400">
                      {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className={`h-full ${goalColor} rounded-full transition-all duration-1000`}
                    />
                  </div>
                  <p className="text-right text-[10px] font-bold text-slate-500">
                    {Math.round(progress)}% Complete
                  </p>
                </div>

                <button
                  className="w-full mt-4 flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-all text-xs font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSavings(e, goal);
                  }}
                >
                  Add Savings
                  <span className="text-sky-500">→</span>
                </button>
              </div>

              {progress >= 100 && (
                <div className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2 rounded-full shadow-sm">
                  <span className="text-xs">🏆</span>
                </div>
              )}
            </div>
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
