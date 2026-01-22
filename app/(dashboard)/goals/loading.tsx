import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Goals Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md opacity-70" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md font-bold" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
