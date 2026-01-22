"use client";

import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

type CustomTooltipPayload = {
  name?: string;
  value?: number | string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: string | number;
};

const COLORS = {
  primary: "#0ea5e9", // sky-500
  danger: "#fb7185", // rose-400 (softer than before)
  success: "#34d399", // emerald-400
  grid: "rgba(148,163,184,0.25)", // lighter grid
};

const getSeriesColor = (name?: string) => {
  if (!name) return COLORS.primary;
  const key = name.toLowerCase();
  if (key.includes("income")) return COLORS.success; // emerald for income
  if (key.includes("expense")) return COLORS.danger; // rose for expense
  return COLORS.primary;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-lg"
      style={{
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: "12px 14px",
      }}
    >
      <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
        {label}
      </div>
      {payload.map((entry: CustomTooltipPayload, idx: number) => {
        const color = getSeriesColor(entry.name ?? undefined);
        return (
          <div
            key={`${entry.name ?? "item"}-${idx}`}
            className="flex items-center gap-2"
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "9999px",
                backgroundColor: color,
              }}
            />
            <span style={{ color, fontWeight: 700, fontSize: "13px" }}>
              {entry.name}: {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface SpendingChartProps {
  monthlyData: { day: string; amount: number }[]; // 今月の日別の支出
  yearlyData: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  }[]; // 年間の月別収支
}

export default function SpendingChart({
  monthlyData,
  yearlyData,
}: SpendingChartProps) {
  const { formatCurrency } = useCurrency();
  const [view, setView] = useState("monthly");

  return (
    <Card className="col-span-4 h-full flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {view === "monthly"
              ? "Daily spending this month"
              : "Monthly income vs expense"}
          </CardDescription>
        </div>
        <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1 pb-2 md:pb-6">
        <div className="h-full w-full min-h-[250px] md:min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {view === "monthly" ? (
              <BarChart data={monthlyData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={COLORS.grid}
                  opacity={0.4}
                />
                <XAxis
                  dataKey="day"
                  dy={8}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  width={62}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#colorMonthly)"
                  stroke={COLORS.primary}
                  strokeWidth={1}
                  radius={[10, 10, 8, 8]}
                  maxBarSize={30}
                  animationDuration={700}
                />
              </BarChart>
            ) : (
              <AreaChart data={yearlyData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.success}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.success}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.danger}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.danger}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={COLORS.grid}
                  opacity={0.4}
                />
                <XAxis
                  dataKey="month"
                  dy={8}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="income"
                  stroke={COLORS.success}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  dot={{ r: 4, strokeWidth: 1.5, stroke: "white" }}
                  activeDot={{ r: 6, strokeWidth: 1.5, stroke: "white" }}
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke={COLORS.danger}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  dot={{ r: 4, strokeWidth: 1.5, stroke: "white" }}
                  activeDot={{ r: 6, strokeWidth: 1.5, stroke: "white" }}
                  name="Expense"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
