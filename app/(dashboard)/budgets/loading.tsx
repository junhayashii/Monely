import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950">
            <Skeleton className="h-4 w-24 rounded-md mb-4" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        ))}
      </div>

      {/* List Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card p-5 rounded-3xl border border-slate-200/70 bg-white dark:bg-slate-950">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full mb-2" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
