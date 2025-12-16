"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const CategoryChart = ({
  data,
}: {
  data: { name: string; value: number }[];
}) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: string | number | undefined) => {
                  // value が存在しない（undefined）場合は空文字や 0 を返す
                  if (value === undefined) return "R$ 0";

                  // 数値としてパースしてフォーマット
                  const num =
                    typeof value === "string" ? parseFloat(value) : value;
                  return [`R$ ${num.toLocaleString()}`, "Amount"]; // [値, ラベル] の形式で返すとより確実です
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
