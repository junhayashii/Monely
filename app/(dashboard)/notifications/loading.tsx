import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Notifications List Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl flex gap-4 border border-slate-200/50 bg-white dark:bg-slate-950">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded-md opacity-70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
