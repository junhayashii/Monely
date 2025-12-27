"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pencil,
  Activity,
  Calendar,
  TrendingUp,
} from "lucide-react";
import TransactionTable from "@/components/transactions/TransactionTable";
import { Transaction } from "@/lib/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { format } from "date-fns";
import AddEditModal from "@/components/AddEditModal";
import DeleteDialog from "@/components/DeleteDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateCategory,
  deleteCategory,
} from "@/app/(dashboard)/budgets/actions";
import { toast } from "sonner";

interface BudgetHistoryProps {
  category: {
    id: string;
    name: string;
    type: "EXPENSE" | "INCOME";
    budget: number | null;
  };
  transactions: Transaction[];
  monthlyData: {
    month: string;
    amount: number;
  }[];
}

interface DetailStatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
}

const DetailStatCard = ({
  label,
  value,
  subValue,
  icon,
}: DetailStatCardProps) => (
  <div className="border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
    <div className="flex items-end justify-between">
      <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </h4>
      {subValue && (
        <span className="text-[10px] font-bold text-slate-400">{subValue}</span>
      )}
    </div>
  </div>
);

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white dark:bg-slate-900 px-3 py-2 shadow-lg">
      <div className="text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        {payload[0].payload.month}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: R$ {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function BudgetHistory({
  category,
  transactions,
  monthlyData,
}: BudgetHistoryProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [name, setName] = useState(category.name);
  const [budget, setBudget] = useState(category.budget || 0);
  const [type, setType] = useState(category.type);

  // 統計データの計算
  const averageSpend = useMemo(() => {
    if (monthlyData.length === 0) return 0;
    const sum = monthlyData.reduce((acc, item) => acc + item.amount, 0);
    return Math.round(sum / monthlyData.length);
  }, [monthlyData]);

  const currentSpent = monthlyData[monthlyData.length - 1]?.amount || 0;
  const isOverLimit = category.budget && currentSpent > category.budget;
  const diff = category.budget ? Math.abs(category.budget - currentSpent) : 0;

  // グラフ用データ（limitも含む）
  const chartData = useMemo(() => {
    return monthlyData.map((item) => ({
      month: item.month,
      spent: item.amount,
      limit: category.budget || 0,
    }));
  }, [monthlyData, category.budget]);

  const primaryColor = category.type === "INCOME" ? "#10b981" : "#0ea5e9";

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("budget", type === "INCOME" ? "0" : budget.toString());

    startTransition(async () => {
      const result = await updateCategory(category.id, formData);
      if (result.success) {
        toast.success(result.message);
        setIsModalOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.success) {
        toast.success(result.message);
        setIsDeleteOpen(false);
        setIsModalOpen(false);
        router.push("/budgets");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/budgets")}
          className="p-3 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 rounded-2xl hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-500 dark:text-slate-400 hover:text-sky-600 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {category.name} History
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Detailed analytics for this specific category
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailStatCard
          label="Average Spend"
          value={`R$ ${averageSpend.toLocaleString()}`}
          icon={<Activity className="w-4 h-4 text-sky-500" />}
        />
        <DetailStatCard
          label="Monthly Limit"
          value={`R$ ${(category.budget || 0).toLocaleString()}`}
          icon={<Calendar className="w-4 h-4 text-emerald-500" />}
        />
        <DetailStatCard
          label="Status"
          value={isOverLimit ? "Over Limit" : "Under Limit"}
          subValue={`R$ ${diff.toLocaleString()} diff`}
          icon={
            <TrendingUp
              className={`w-4 h-4 ${
                isOverLimit ? "text-rose-500" : "text-emerald-500"
              }`}
            />
          }
        />
      </div>

      {/* Category Trend Chart */}
      <div className="border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] shadow-sm">
        <div className="mb-8">
          <h4 className="font-bold text-slate-900 dark:text-white">
            6-Month Spending Trend
          </h4>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={primaryColor}
                    stopOpacity={0.3}
                  />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-slate-800"
                opacity={0.3}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="spent"
                name="Actual Spending"
                stroke={primaryColor}
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorSpent)"
              />
              {category.budget && (
                <Area
                  type="step"
                  dataKey="limit"
                  name="Budget Limit"
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Message */}
      <div className="p-6 rounded-3xl bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <TrendingUp className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white">
              Budget Insight
            </h5>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {isOverLimit
                ? `Your ${category.name.toLowerCase()} spending is currently over budget by R$ ${diff.toLocaleString()}. Consider reviewing your expenses to stay within your monthly limit.`
                : `Your ${category.name.toLowerCase()} spending is within budget. You have R$ ${diff.toLocaleString()} remaining this month. Keep up the good work!`}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] shadow-sm">
        <div className="mb-6">
          <h4 className="font-bold text-slate-900 dark:text-white">
            Transactions
          </h4>
        </div>
        {transactions.length > 0 ? (
          <TransactionTable data={transactions} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found for this category.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AddEditModal
        title="Edit Category"
        description={
          type === "INCOME"
            ? "Set your income category name."
            : "Set your category name and monthly target amount."
        }
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setName(category.name);
            setBudget(category.budget || 0);
            setType(category.type);
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
            <Select
              value={type}
              onValueChange={(value) => setType(value as "EXPENSE" | "INCOME")}
            >
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
            <Button
              variant="destructive"
              onClick={() => {
                setIsDeleteOpen(true);
              }}
            >
              Delete
            </Button>
            <Button className="ml-auto" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </AddEditModal>

      <DeleteDialog
        open={isDeleteOpen}
        title={`Delete "${category.name}"?`}
        description="This will permanently delete this category and all related transaction history. This action cannot be undone."
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isConfirming={isPending}
      />
    </div>
  );
}
