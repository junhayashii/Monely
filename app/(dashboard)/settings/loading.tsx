import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 pt-2 pb-16 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
      </div>

      {/* Settings Content Skeleton */}
      <div className="grid gap-8 mt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-[2.5rem] border border-slate-200/50 bg-white dark:bg-slate-950">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-4 w-48 rounded-md opacity-70" />
              </div>
            </div>
            <div className="space-y-4 px-2">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-40 rounded-md opacity-70" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
