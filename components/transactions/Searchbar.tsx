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
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by title..."
        className="pl-9 border-slate-200/70 dark:border-slate-800/70 focus-visible:ring-2 focus-visible:ring-sky-500/20"
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground animate-pulse">
          Searching...
        </div>
      )}
    </div>
  );
};

export default Searchbar;
