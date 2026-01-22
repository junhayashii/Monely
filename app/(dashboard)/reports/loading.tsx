import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
      </div>

      {/* View Toggle Skeleton */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 w-full sm:w-64">
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>

      {/* Insight Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-[2.5rem] flex items-center gap-6 border border-slate-200/50 bg-white dark:bg-slate-950">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-md opacity-70" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="glass-card p-8 rounded-[2.5rem] min-h-[400px] border border-slate-200/50 bg-white dark:bg-slate-950">
            <div className="space-y-2 mb-8">
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md opacity-70" />
            </div>
            <Skeleton className="h-[250px] w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
