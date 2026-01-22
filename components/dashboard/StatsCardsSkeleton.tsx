import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-6 rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg mb-2" />
          <Skeleton className="h-4 w-16 rounded-md opacity-70" />
        </div>
      ))}
    </div>
  );
}
