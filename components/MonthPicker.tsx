"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addMonths, format, parse, startOfMonth, subMonths } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MonthPicker = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const now = startOfMonth(new Date());
  const minMonth = subMonths(now, 12); // 1 year back
  const maxMonth = addMonths(now, 1); // up to next month

  const selectedMonth = useMemo(() => {
    const monthParam = searchParams.get("month");
    const fallback = format(now, "yyyy-MM");
    if (!monthParam) return fallback;

    const parsed = parse(monthParam, "yyyy-MM", new Date());
    if (isNaN(parsed.getTime())) return fallback;

    const clamped =
      parsed < minMonth ? minMonth : parsed > maxMonth ? maxMonth : parsed;
    return format(clamped, "yyyy-MM");
  }, [searchParams, maxMonth, minMonth, now]);

  const pushMonth = (val: string) => {
    const parsed = parse(val, "yyyy-MM", new Date());
    if (isNaN(parsed.getTime())) return;
    const clamped =
      parsed < minMonth ? minMonth : parsed > maxMonth ? maxMonth : parsed;

    const params = new URLSearchParams(searchParams);
    params.set("month", format(clamped, "yyyy-MM"));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStep = (step: number) => {
    const parsed = parse(selectedMonth, "yyyy-MM", new Date());
    const next = addMonths(parsed, step);
    pushMonth(format(next, "yyyy-MM"));
  };

  const monthOptions = useMemo(() => {
    const options = [];
    for (let d = minMonth; d <= maxMonth; d = addMonths(d, 1)) {
      options.push({
        value: format(d, "yyyy-MM"),
        label: format(d, "MMM yyyy"),
      });
    }
    return options;
  }, [maxMonth, minMonth]);

  const prettyLabel = format(
    parse(selectedMonth, "yyyy-MM", new Date()),
    "MMM yyyy"
  );

  const isAtMin =
    format(parse(selectedMonth, "yyyy-MM", new Date()), "yyyy-MM") ===
    format(minMonth, "yyyy-MM");
  const isAtMax =
    format(parse(selectedMonth, "yyyy-MM", new Date()), "yyyy-MM") ===
    format(maxMonth, "yyyy-MM");

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white px-1 py-0.5 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/60">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous month"
        disabled={isAtMin}
        onClick={() => handleStep(-1)}
        className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Select value={selectedMonth} onValueChange={pushMonth}>
        <SelectTrigger
          size="sm"
          aria-label="Select month"
          className="px-3 py-2 border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-slate-100 dark:hover:bg-slate-800 [&>*:last-child]:hidden h-8"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={prettyLabel} aria-label={prettyLabel} />
        </SelectTrigger>
        <SelectContent className="w-[180px] max-h-56 overflow-y-auto">
          {monthOptions.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next month"
        disabled={isAtMax}
        onClick={() => handleStep(1)}
        className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MonthPicker;
