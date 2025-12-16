"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const MonthPicker = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMonth = searchParams.get("month") || "";

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set("month", val);
    } else {
      params.delete("month");
    }
    router.push(`/transactions?${params.toString()}`);
  };
  return (
    <div className="w-full sm:w-[200px]">
      <Input
        type="month"
        value={currentMonth}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

export default MonthPicker;
