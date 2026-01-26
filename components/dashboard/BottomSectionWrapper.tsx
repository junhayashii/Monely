import BudgetProgress from "./BudgetProgress";
import { getCachedBottomSectionData } from "@/lib/dashboard-fetching";
import RecentTransactions from "./RecentTransactions";

interface BottomSectionWrapperProps {
  userId: string;
  currentMonth: Date;
}

export default async function BottomSectionWrapper({
  userId,
  currentMonth,
}: BottomSectionWrapperProps) {
  const { categories, categoryGrouped } = await getCachedBottomSectionData(userId, currentMonth);


  const spentMap = categoryGrouped.reduce((acc, curr) => {
    if (curr.categoryId) acc[curr.categoryId] = curr._sum.amount || 0;
    return acc;
  }, {} as Record<string, number>);

  const budgetData = categories.map((cat) => {
    const spent = spentMap[cat.id] || 0;
    const budget = cat.budget || 0;
    const progress = (spent / budget) * 100;
    return {
      name: cat.name,
      spent,
      budget,
      progress: Math.min(progress, 100),
      status: progress > 90 ? "text-rose-600" : "text-emerald-600",
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-4 items-stretch">
      {/* Recent Transactions */}
      <div className="md:col-span-2">
        <RecentTransactions userId={userId} currentMonth={currentMonth}/>
      </div>

      {/* Budget Progress */}
      <div className="md:col-span-2">
        <BudgetProgress data={budgetData.slice(0, 6)} />
      </div>
    </div>
  );
}
