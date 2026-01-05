"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";

const COLORS = [
  "#0ea5e9", // sky-500 - primary
  "#fb7185", // rose-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#818cf8", // indigo-400
  "#f472b6", // pink-400
  "#a78bfa", // violet-400
];

type CategoryDatum = { name: string; value: number };

const CustomTooltip = ({
  active,
  payload,
  total,
  formatCurrency,
}: {
  active?: boolean;
  payload?: {
    name?: string;
    value?: number;
    payload?: { percent?: number; value?: number };
  }[];
  total: number;
  formatCurrency: (value: number) => string;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  const value =
    typeof entry?.value === "number"
      ? entry.value
      : parseFloat(String(entry?.value ?? 0));
  const percent =
    total > 0
      ? Math.round(((entry?.payload?.value ?? value) / total) * 100)
      : 0;

  return (
    <div
      className="rounded-2xl border border-slate-200/70 bg-white px-3 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95"
      style={{
        minWidth: 170,
        transform: "translateY(0)",
        transition: "opacity 150ms ease, transform 150ms ease",
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {entry?.name}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-lg font-bold text-slate-900 dark:text-white">
          {formatCurrency(value)}
        </div>
        <span className="rounded-full bg-sky-100 px-2 py-[2px] text-[11px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/20 dark:text-sky-100 dark:ring-sky-400/30">
          {percent}%
        </span>
      </div>
    </div>
  );
};

const CategoryChart = ({ data }: { data: CategoryDatum[] }) => {
  const { formatCurrency } = useCurrency();
  const cleaned = data.filter((d) => d.value > 0);
  const total = cleaned.reduce((sum, item) => sum + item.value, 0);

  if (!cleaned.length) {
    return (
      <Card className="col-span-4 h-full flex flex-col">
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 py-10 text-center text-sm text-muted-foreground">
          No expenses recorded for this month.
        </CardContent>
      </Card>
    );
  }

  // Format currency without decimals
  const formatCurrencyNoDecimals = (value: number) => {
    const formatted = formatCurrency(value);
    // Remove .00 if present
    return formatted.replace(/\.00$/, "");
  };

  return (
    <Card className="col-span-4 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="h-full w-full min-h-[200px] max-h-[250px] -mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cleaned}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                cornerRadius={8}
              >
                {cleaned.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length] ?? COLORS[0]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <CustomTooltip
                    total={total}
                    formatCurrency={formatCurrencyNoDecimals}
                  />
                }
                offset={12}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{
                  outline: "none",
                  pointerEvents: "none",
                  transition: "opacity 150ms ease, transform 150ms ease",
                }}
              />
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-center"
              >
                <tspan
                  className="fill-slate-500 text-xs font-semibold uppercase tracking-wide"
                  x="50%"
                  dy="-0.4em"
                >
                  Total
                </tspan>
                <tspan
                  className="fill-slate-900 text-sm font-bold dark:fill-white"
                  x="50%"
                  dy="1.2em"
                >
                  {formatCurrencyNoDecimals(total)}
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3 justify-center text-sm text-slate-700 dark:text-slate-200 mt-3">
          {cleaned.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: COLORS[idx % COLORS.length] ?? COLORS[0],
                }}
              />
              <span className="font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
