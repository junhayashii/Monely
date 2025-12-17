import React from "react";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";

interface BudgetCardProps {
  name: string;
  spent: number;
  budget: number;
  onClick: () => void;
}

const BudgetCard = ({ name, spent, budget, onClick }: BudgetCardProps) => {
  const percent = budget > 0 ? (spent / budget) * 100 : 0;
  const left = budget - spent;
  const isOver = left < 0;

  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{name}</h3>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Budget
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              R$ {(spent || 0).toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              of R$ {(budget || 0).toLocaleString()}
            </span>
          </div>
          <Progress value={Math.min(percent, 100)} className="h-2" />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {percent.toFixed(0)}% Used
          </span>
          <span
            className={`font-semibold ${
              isOver ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {isOver ? "Over Budget" : `R$ ${left.toLocaleString()} Left`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
