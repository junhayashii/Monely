"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

const AddBudgetButton = () => {
  const router = useRouter();
  
  return (
    <>
      <Button
        onClick={() => router.push("?mode=add")}
        className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <Plus className="w-4 h-4" />
        New Budget
      </Button>
      <Button
        onClick={() => router.push("?mode=add")}
        size="icon"
        className="md:hidden fixed bottom-6 right-6 size-14 rounded-full shadow-2xl z-50 bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all text-white border-0 flex items-center justify-center p-0"
      >
        <Plus className="size-8" />
      </Button>
    </>
  );
};

export default AddBudgetButton;
