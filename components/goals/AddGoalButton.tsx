"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

const AddGoalButton = () => {
  const router = useRouter();
  
  return (
    <>
      <Button
        onClick={() => router.push("?mode=add")}
        className="hidden md:flex gap-2 shadow-sm hover:shadow-md transition-shadow"
      >
        <Plus className="h-4 w-4" />
        Add Goal
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

export default AddGoalButton;
