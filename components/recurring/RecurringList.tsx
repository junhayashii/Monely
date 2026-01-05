"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import AddEditModal from "@/components/AddEditModal";
import RecurringForm from "./RecurringForm";
import { RecurringBill, Category, Wallet } from "@/lib/generated/prisma";
import { useCurrency } from "@/contexts/CurrencyContext";

interface RecurringBillWithRelations extends RecurringBill {
  category: Category | null;
  wallet: Wallet;
}

interface RecurringListProps {
  bills: RecurringBillWithRelations[];
  wallets: Wallet[];
  categories: Category[];
}

function RecurringList({ bills, wallets, categories }: RecurringListProps) {
  const { formatCurrency } = useCurrency();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] =
    useState<RecurringBillWithRelations | null>(null);
  const [, startTransition] = useTransition();

  // クエリパラメータからmode=addを監視
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "add" && !isModalOpen) {
      startTransition(() => {
        setSelectedBill(null);
        setIsModalOpen(true);
      });
    }
  }, [searchParams, isModalOpen, startTransition]);

  const handleEdit = (bill: RecurringBillWithRelations) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // クエリパラメータをクリア
    router.push("/recurring");
  };

  const totalMonthly = bills
    .filter((b) => b.frequency === "MONTHLY")
    .reduce((sum, b) => sum + b.amount, 0);

  const totalYearly = bills
    .filter((b) => b.frequency === "YEARLY")
    .reduce((sum, b) => sum + b.amount, 0);

  const formatNextDate = (date: Date | string) => {
    const nextDate = typeof date === "string" ? new Date(date) : date;
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Overdue";
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return nextDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getDateColor = (date: Date | string) => {
    const nextDate = typeof date === "string" ? new Date(date) : date;
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "text-rose-600 dark:text-rose-400";
    } else if (diffDays <= 3) {
      return "text-amber-600 dark:text-amber-400";
    } else {
      return "text-muted-foreground";
    }
  };

  // For now, treat all bills as active since isActive field may not exist
  const activeBills = bills;
  const pausedBills: typeof bills = [];

  return (
    <div className="space-y-12">
      {/* Elegant Fluid Header */}
      <div className="relative p-10 rounded-[3rem] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-indigo-400/10 to-transparent dark:from-sky-900/40 dark:via-slate-900/20" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-300/20 blur-[100px] rounded-full animate-pulse" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
              Monthly Commitment
            </div>
            <h2 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(totalMonthly)}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium opacity-80">
              Your automated wealth outflows for this cycle.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-card px-6 py-4 rounded-3xl text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
              <p className="text-xl font-bold dark:text-white">{activeBills.length}</p>
            </div>
            <div className="glass-card px-6 py-4 rounded-3xl text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paused</p>
              <p className="text-xl font-bold dark:text-white">{pausedBills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="glass-card p-12 rounded-[2.5rem] text-center">
          <p className="text-slate-500 dark:text-slate-400">
            No recurring bills yet. Click &quot;Add Bill&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-4 px-2">
          {bills.map((bill) => {
            const isActive = true; // All bills are active for now
            const categoryColor = bill.category?.name === "Entertainment" ? "bg-rose-400" :
                                 bill.category?.name === "Housing" ? "bg-sky-400" :
                                 bill.category?.name === "Health" ? "bg-emerald-400" :
                                 bill.category?.name === "Shopping" ? "bg-amber-400" :
                                 bill.category?.name === "Software" ? "bg-indigo-400" :
                                 "bg-slate-400";
            
            return (
              <div
                key={bill.id}
                className={`group relative flex items-center justify-between p-6 rounded-[2rem] transition-all duration-500 ${
                  isActive 
                  ? 'glass-card hover:shadow-2xl hover:shadow-sky-100 dark:hover:shadow-none border border-slate-200/50 dark:border-slate-800/50' 
                  : 'opacity-50 grayscale hover:grayscale-0 bg-slate-50 dark:bg-slate-900/20 border border-transparent'
                }`}
                onClick={() => handleEdit(bill)}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${categoryColor} bg-opacity-10 ${categoryColor.replace('bg-', 'text-')}`}>
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                      {bill.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>{bill.frequency === "MONTHLY" ? "Monthly" : "Yearly"}</span>
                      <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <span>Next: {formatNextDate(bill.nextDate)}</span>
                      {bill.category && (
                        <>
                          <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                          <span>{bill.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(bill.amount)}
                    </p>
                    <p className={`text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'text-sky-500' : 'text-slate-400'}`}>
                      {isActive ? 'Active Tracking' : 'Paused'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddEditModal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          } else {
            setIsModalOpen(true);
          }
        }}
        title={selectedBill ? "Edit Bill" : "Add Recurring Bill"}
        description="Manage your subscriptions and fixed expenses."
      >
        <RecurringForm
          bill={selectedBill}
          wallets={wallets}
          categories={categories}
          onSuccess={closeModal}
        />
      </AddEditModal>
    </div>
  );
}

export default RecurringList;
