"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { StringFormatParams } from "zod/v4/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const TransactionFilters = ({ categories, wallets }: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Type Filter */}
      <Select
        value={searchParams.get("type") || "all"}
        onValueChange={(v) => updateFilter("type", v)}
      >
        <SelectTrigger className="w-full sm:w-[140px] border-slate-200/70 dark:border-slate-800/70">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="INCOME">Income</SelectItem>
          <SelectItem value="EXPENSE">Expense</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={searchParams.get("categoryId") || "all"}
        onValueChange={(v) => updateFilter("categoryId", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] border-slate-200/70 dark:border-slate-800/70">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c: any) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Wallet Filter */}
      <Select
        value={searchParams.get("walletId") || "all"}
        onValueChange={(v) => updateFilter("walletId", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px] border-slate-200/70 dark:border-slate-800/70">
          <SelectValue placeholder="Wallet" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Wallets</SelectItem>
          {wallets.map((w: any) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TransactionFilters;
