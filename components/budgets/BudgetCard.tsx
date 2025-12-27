import React from "react";
import { Card, CardContent } from "../ui/card";
import {
  PieChart as PieChartIcon,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

interface BudgetCardProps {
  name: string;
  spent: number;
  budget: number;
  type?: "EXPENSE" | "INCOME";
  onClick: () => void;
  onEdit?: () => void;
}

const BudgetCard = ({
  name,
  spent,
  budget,
  type = "EXPENSE",
  onClick,
  onEdit,
}: BudgetCardProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  // Incomeの場合はシンプルな表示
  if (type === "INCOME") {
    return (
      <Card
        className="cursor-pointer border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 rounded-2rem hover:border-sky-100 dark:hover:border-sky-900/30 transition-all group shadow-sm"
        onClick={onClick}
      >
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <PieChartIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {name}
                </h4>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Income
                </p>
              </div>
            </div>
            <button
              className="p-2 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-colors"
              onClick={handleEditClick}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
              This Month
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              R$ {(spent || 0).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expenseの場合は従来通りの表示
  const percent = budget > 0 ? (spent / budget) * 100 : 0;
  const left = budget - spent;
  const isOver = left < 0;
  const isWarning = percent > 85;

  return (
    <Card
      className="cursor-pointer border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 rounded-2rem flex flex-col gap-5 hover:border-sky-100 dark:hover:border-sky-900/30 transition-all group shadow-sm"
      onClick={onClick}
    >
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400`}
            >
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                {name}
              </h4>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Plan R$ {(budget || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            className="p-2 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-colors"
            onClick={handleEditClick}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Spent
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                R$ {(spent || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Left
              </p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                R$ {Math.max(left, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOver
                  ? "bg-rose-500"
                  : isWarning
                  ? "bg-amber-400"
                  : "bg-sky-500"
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>

        <div className="pt-4 mt-auto border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
              isOver ? "text-rose-500" : "text-emerald-500"
            }`}
          >
            {isOver ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <CheckCircle2 className="w-3 h-3" />
            )}
            {isOver ? "Over Budget" : "On Track"}
          </div>
          <button className="text-[10px] font-bold text-sky-500 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
            Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
