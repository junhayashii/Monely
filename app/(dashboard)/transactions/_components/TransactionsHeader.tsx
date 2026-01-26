import MonthPicker from "@/components/MonthPicker";
import AddTransactionButton from "@/components/transactions/AddTransactionButton";
import ImportOFXButton from "@/components/transactions/ImportOFXButton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { format, parseISO } from "date-fns";

export function TransactionsHeader({ month }: { month?: string }) {
  const selectedMonth = month ? parseISO(`${month}-01`) : new Date();
  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="md:hidden">
          <SidebarTrigger className="size-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0" />
        </div>
        <div>
          <h1 className="text-lg md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and track all your financial transactions
            {month && ` • ${format(selectedMonth, "MMMM yyyy")}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:gap-3">
        <div className="scale-[0.85] xs:scale-90 sm:scale-100 origin-right flex items-center gap-2">
          <MonthPicker />
          <ImportOFXButton />
        </div>
        <AddTransactionButton />
      </div>
    </div>
  );
}
