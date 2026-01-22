import { Suspense } from "react";
import { format, parse, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase";
import MonthPicker from "@/components/MonthPicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthSuccessToast } from "@/components/auth/AuthSuccessToast";
import StatsCardsSkeleton from "@/components/dashboard/StatsCardsSkeleton";
import ChartsSkeleton from "@/components/dashboard/ChartsSkeleton";
import BottomSectionSkeleton from "@/components/dashboard/BottomSectionSkeleton";

// Streaming Components
import StatsCardsWrapper from "@/components/dashboard/StatsCardsWrapper";
import ChartsWrapper from "@/components/dashboard/ChartsWrapper";
import BottomSectionWrapper from "@/components/dashboard/BottomSectionWrapper";

type Props = {
  searchParams: Promise<{
    month?: string;
    auth?: string;
  }>;
};

async function DashboardPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const month = resolvedParams.month;
  const authStatus = resolvedParams.auth;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const monthParam = month || format(new Date(), "yyyy-MM");
  const currentMonth = parse(monthParam, "yyyy-MM", new Date());

  return (
    <div className="space-y-8 pb-16">
      <AuthSuccessToast authStatus={authStatus} />

      {/* Header - Immediate Render */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="md:hidden">
            <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
              An Overview of {format(currentMonth, "MMMM yyyy")}
            </p>
          </div>
        </div>
        <div className="scale-90 sm:scale-100 origin-right">
          <MonthPicker />
        </div>
      </div>

      {/* Stats Cards - Streamed */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCardsWrapper userId={userId} currentMonth={currentMonth} />
      </Suspense>

      {/* Overlays/Charts - Streamed */}
      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsWrapper userId={userId} currentMonth={currentMonth} />
      </Suspense>

      {/* Transitions & Budgets - Streamed */}
      <Suspense fallback={<BottomSectionSkeleton />}>
        <BottomSectionWrapper userId={userId} currentMonth={currentMonth} />
      </Suspense>
    </div>
  );
}

export default DashboardPage;
