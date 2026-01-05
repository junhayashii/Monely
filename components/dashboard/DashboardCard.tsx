"use client";

import type { ReactNode } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";

interface DashboardCardProps {
  title: string;
  amount: number;
  icon: ReactNode;
  trend?: string;
  isPositive?: boolean;
  className?: string;
  color?: string;
}

// Generate simple sparkline data
const generateSparkData = () => {
  return Array.from({ length: 7 }, () => ({
    value: Math.random() * 100 + 50,
  }));
};

const DashboardCard = ({
  title,
  amount,
  icon,
  trend,
  isPositive = true,
  className = "",
  color = "#0ea5e9",
}: DashboardCardProps) => {
  const { formatCurrency } = useCurrency();
  const sparkData = generateSparkData();
  
  return (
    <Card className="glass-card relative overflow-hidden rounded-[2rem] shadow-sm transition-lumina hover:-translate-y-1 hover:shadow-lumina border border-transparent hover:border-sky-100 dark:hover:border-sky-900/30 group">
      <CardContent className="relative p-6 flex flex-col gap-5 z-10">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {trend && (
            <span
              className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                isPositive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              {trend}
            </span>
          )}
        </div>

        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            {title}
          </p>
          <p
            className={`text-2xl font-bold mt-1 text-slate-900 dark:text-white ${className}`}
          >
            {formatCurrency(amount)}
          </p>
        </div>
      </CardContent>
      
      {/* Sparkline Chart */}
      <div className="absolute inset-x-0 bottom-0 h-16 opacity-30 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              strokeWidth={2}
              fillOpacity={0.2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DashboardCard;
