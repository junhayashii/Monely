import { Skeleton } from "@/components/ui/skeleton";

export default function BottomSectionSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4 items-stretch">
      <div className="md:col-span-2">
        <div className="glass-card p-6 min-h-[400px] rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="h-4 w-56 rounded-md opacity-70" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2 rounded-md" />
                  <Skeleton className="h-4 w-1/3 rounded-md opacity-70" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="glass-card p-6 min-h-[400px] rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md opacity-70" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
