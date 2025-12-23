"use client";

import { useState } from "react";

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
  primary: "#0ea5e9",
  danger: "#f43f5e",
  grid: "rgba(148,163,184,0.35)",
};

const getSeriesColor = (name?: string) => {
  if (!name) return COLORS.primary;
  const key = name.toLowerCase();
  if (key.includes("income")) return COLORS.primary;
  if (key.includes("expense")) return COLORS.danger;
  return COLORS.primary;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        borderRadius: "14px",
        border: "none",
        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: "12px 14px",
      }}
    >
      <div style={{ color: "#475569", fontSize: 12, marginBottom: 6 }}>
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
            <span style={{ color, fontWeight: 700 }}>
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
  const [view, setView] = useState("monthly");

  return (
    <Card className="col-span-4 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Spending Overview</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {view === "monthly"
              ? "Daily spending this month"
              : "Monthly income vs expense"}
          </CardDescription>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly (Daily)</TabsTrigger>
            <TabsTrigger value="yearly">Yearly (Monthly)</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full w-full min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            {view === "monthly" ? (
              <BarChart data={monthlyData} margin={{ left: -12, right: 8 }}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={COLORS.grid}
                  opacity={0.8}
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
                  tickFormatter={(value) => `R$${value}`}
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
              <AreaChart data={yearlyData} margin={{ left: -6, right: 6 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.danger}
                      stopOpacity={0.25}
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
                  opacity={0.9}
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
                  tickFormatter={(value) => `R$${value}`}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="income"
                  stroke={COLORS.primary}
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
