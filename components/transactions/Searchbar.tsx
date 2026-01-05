"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

const Searchbar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`/transactions?${params.toString()}`);
    });
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
      <div className="relative px-4 py-4">
        <Search className="absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <Input
          placeholder="Search by title..."
          className="pl-10 pr-24 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-auto py-0 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          defaultValue={searchParams.get("q")?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {isPending && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 animate-pulse">
            Searching...
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
