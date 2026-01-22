import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 mt-2 rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-36 rounded-[2rem]" />
          <Skeleton className="h-12 w-44 rounded-[2rem]" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Skeleton className="h-14 w-full rounded-[2.5rem]" />
        </div>
        <div className="sm:w-auto">
          <Skeleton className="h-14 w-32 rounded-[2.5rem]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="glass-card rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3 rounded-md" />
                  <Skeleton className="h-4 w-1/4 rounded-md opacity-70" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
