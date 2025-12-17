import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

interface BudgetData {
  name: string;
  spent: number;
  budget: number;
  progress: number;
  status: string;
}

const BudgetProgress = ({ data }: { data: BudgetData[] }) => {
  return (
    <Card>
      <CardHeader className="col-span-3">
        <CardTitle>Budget Status</CardTitle>
      </CardHeader>
      <CardContent>
        {data.map((item) => (
          <div key={item.name} className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{item.name}</span>
              <span className="item.status">
                R$ {item.spent.toLocaleString()} / R${" "}
                {item.budget.toLocaleString()}
              </span>
            </div>
            <Progress value={item.progress} className="h-2" />
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No budgets set for this month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
