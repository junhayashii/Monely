"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Filter, X } from "lucide-react";
import { useState } from "react";

const TransactionFilters = ({ categories, wallets }: any) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    params.delete("categoryId");
    params.delete("walletId");
    router.push(`?${params.toString()}`);
  };

  // アクティブなフィルタの数を計算
  const activeFiltersCount = [
    searchParams.get("type"),
    searchParams.get("categoryId"),
    searchParams.get("walletId"),
  ].filter(Boolean).length;

  const selectedType = searchParams.get("type") || "all";
  const selectedCategoryId = searchParams.get("categoryId") || "all";
  const selectedWalletId = searchParams.get("walletId") || "all";

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-sm bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/70">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="w-full sm:w-auto h-full px-6 py-4 border-0 hover:bg-transparent"
          >
            <Filter className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Filters
            </span>
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 min-w-5 px-1.5 text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 rounded-2xl border-slate-200/70 dark:border-slate-800/70" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Filter Transactions
              </h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Type
                </label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => updateFilter("type", v)}
                >
                  <SelectTrigger className="w-full border-slate-200/70 dark:border-slate-800/70 rounded-xl">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Category
                </label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(v) => updateFilter("categoryId", v)}
                >
                  <SelectTrigger className="w-full border-slate-200/70 dark:border-slate-800/70 rounded-xl">
                    <SelectValue placeholder="All Categories" />
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
              </div>

              {/* Wallet Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Wallet
                </label>
                <Select
                  value={selectedWalletId}
                  onValueChange={(v) => updateFilter("walletId", v)}
                >
                  <SelectTrigger className="w-full border-slate-200/70 dark:border-slate-800/70 rounded-xl">
                    <SelectValue placeholder="All Wallets" />
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
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TransactionFilters;
