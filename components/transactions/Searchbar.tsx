"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Search } from "lucide-react";

const Searchbar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.push(`/transactions?${params.toString()}`);
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [term, searchParams, router]);

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-sm bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/70">
      <div className="relative flex items-center px-6 h-14">
        <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
        <Input
          placeholder="Search items..."
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-full px-3 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold text-slate-800 dark:text-slate-200"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        {isPending && (
          <div className="text-[10px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400 animate-pulse ml-2">
            Updating...
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchbar;
