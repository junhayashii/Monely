"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createGoal, updateGoal } from "@/app/(dashboard)/goals/actions";

interface GoalFormProps {
  goal?: any;
  onSuccess: () => void;
}

function GoalForm({ goal, onSuccess }: GoalFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || 0);
  const [deadline, setDeadline] = useState(
    goal?.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : ""
  );

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("targetAmount", targetAmount.toString());
    formData.append("deadline", deadline);

    startTransition(async () => {
      // 編集なら updateGoal、新規なら createGoal を呼ぶ
      const result = goal
        ? await updateGoal(goal.id, formData)
        : await createGoal(formData);

      if (result.success) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4 py-4 px-6">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. New Car, Vacation"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="target">Target Amount (R$)</Label>
        <Input
          id="target"
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(Number(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (Optional)</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Saving..." : "Save Goal"}
      </Button>
    </div>
  );
}

export default GoalForm;
