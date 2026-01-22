import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Bills List Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 border border-slate-200/50 bg-white dark:bg-slate-950">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md opacity-70" />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden sm:block space-y-1 text-right">
                <Skeleton className="h-3 w-16 ml-auto rounded-md" />
                <Skeleton className="h-4 w-20 ml-auto rounded-md" />
              </div>
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
