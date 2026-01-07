"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart2,
  Download,
  Activity,
  History,
  PiggyBank,
  Zap,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const PIE_COLORS = [
  "#0ea5e9", // sky-500
  "#f472b6", // pink-400
  "#a78bfa", // violet-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#f87171", // red-400
  "#64748b", // slate-500
];

interface ReportsContentProps {
  monthlyData: {
    month: string;
    income: number;
    expense: number;
    balance: number;
  }[];
  categoryData: { name: string; value: number }[];
  savingsRate: number;
  topCategory: { name: string; value: number } | null;
  monthlyDelta: number;
}

const InsightCard: React.FC<{
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, description, icon, color }) => (
  <div className="glass-card p-6 rounded-3xl flex items-center gap-6 hover:-translate-y-1 transition-all">
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {title}
      </p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
        {description}
      </p>
    </div>
  </div>
);

export default function ReportsContent({
  monthlyData,
  categoryData,
  savingsRate,
  topCategory,
  monthlyDelta,
}: ReportsContentProps) {
  const { formatCurrency } = useCurrency();
  const [view, setView] = useState<"Snapshot" | "History">("Snapshot");

  const tickColor = "#94a3b8";
  const gridColor = "#e2e8f0";

  // Calculate top category percentage
  const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.value, 0);
  const topCategoryPercent =
    topCategory && totalExpenses > 0
      ? Math.round((topCategory.value / totalExpenses) * 100)
      : 0;

  // Calculate savings rate change (simplified)
  const savingsRateChange = savingsRate > 0 ? "+12%" : "-5%";

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze your financial patterns and trends
          </p>
        </div>
      </div>

      {/* View Toggle & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 w-full sm:w-auto">
          {(["Snapshot", "History"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                view === v
                  ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {v === "Snapshot" ? (
                <Activity className="w-3.5 h-3.5" />
              ) : (
                <History className="w-3.5 h-3.5" />
              )}
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "Snapshot" ? (
        <div className="space-y-8">
          {/* Analytical Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightCard
              title="Savings Rate"
              value={`${savingsRate.toFixed(1)}%`}
              description={`${savingsRateChange} from last month`}
              icon={<PiggyBank className="w-5 h-5 text-sky-500" />}
              color="bg-sky-50 dark:bg-sky-900/20"
            />
            <InsightCard
              title="Top Category"
              value={topCategory?.name || "N/A"}
              description={
                topCategory
                  ? `${topCategoryPercent}% of total expenses`
                  : "No expenses recorded"
              }
              icon={<Zap className="w-5 h-5 text-amber-500" />}
              color="bg-amber-50 dark:bg-amber-900/20"
            />
            <InsightCard
              title="Monthly Delta"
              value={formatCurrency(Math.abs(monthlyDelta))}
              description={
                monthlyDelta >= 0
                  ? "Net wealth increase"
                  : "Net wealth decrease"
              }
              icon={
                monthlyDelta >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-500" />
                )
              }
              color={
                monthlyDelta >= 0
                  ? "bg-emerald-50 dark:bg-emerald-900/20"
                  : "bg-rose-50 dark:bg-rose-900/20"
              }
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Performance Chart */}
            <div className="glass-card p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                    <BarChart2 className="w-5 h-5 text-sky-500" /> Performance
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Income vs. Expenses
                  </p>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData.slice(-4)}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={gridColor}
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: tickColor, fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: tickColor, fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#0f172a",
                      }}
                      formatter={(value: number | undefined) =>
                        value !== undefined ? formatCurrency(value) : ""
                      }
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar
                      dataKey="income"
                      fill="#0ea5e9"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                      name="Income"
                    />
                    <Bar
                      dataKey="expense"
                      fill="#f43f5e"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                      name="Expense"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="glass-card p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                    <PieChartIcon className="w-5 h-5 text-pink-500" />{" "}
                    Distribution
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Spending by category
                  </p>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#0f172a",
                      }}
                      formatter={(value: number | undefined) =>
                        value !== undefined ? formatCurrency(value) : ""
                      }
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Historical Wealth Trend */}
          <div className="glass-card p-8 rounded-[2.5rem]">
            <div className="mb-8">
              <h3 className="text-xl font-bold dark:text-white">
                Net Wealth Evolution
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cumulative balance across all assets over 6 months
              </p>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="colorBalance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={gridColor}
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      backgroundColor: "#fff",
                    }}
                    formatter={(value: number | undefined) =>
                      value !== undefined ? formatCurrency(value) : ""
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#0ea5e9"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Categorized Spending History */}
          <div className="glass-card p-8 rounded-[2.5rem]">
            <div className="mb-8">
              <h3 className="text-xl font-bold dark:text-white">
                Spending Trends by Category
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Monthly breakdown of major expense pillars
              </p>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={gridColor}
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      backgroundColor: "#fff",
                    }}
                    formatter={(value: number | undefined) =>
                      value !== undefined ? formatCurrency(value) : ""
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke={PIE_COLORS[0]}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke={PIE_COLORS[1]}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Expense"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
