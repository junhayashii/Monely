import { Skeleton } from "@/components/ui/skeleton";

export default function ChartsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3 items-stretch">
      <div className="md:col-span-2">
        <div className="glass-card p-6 h-[400px] md:h-[450px] rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md opacity-70" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <Skeleton className="h-[250px] md:h-[300px] w-full rounded-2xl" />
        </div>
      </div>
      <div className="md:col-span-1">
        <div className="glass-card p-6 h-[400px] md:h-[450px] rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950">
          <div className="space-y-2 mb-8">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md opacity-70" />
          </div>
          <div className="flex items-center justify-center h-[250px] md:h-[300px]">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
