"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CalendarClock, Repeat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Monthly Total</p>
              <h2 className="text-3xl font-bold">
                {formatCurrency(totalMonthly)}
              </h2>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Yearly Total</p>
              <h2 className="text-3xl font-bold">
                {formatCurrency(totalYearly)}
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Grid */}
      {bills.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">
                No recurring bills yet. Click &quot;Add Bill&quot; to create
                one.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => (
            <Card
              key={bill.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleEdit(bill)}
            >
              <CardContent className="pt-6 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg leading-tight">
                    {bill.name}
                  </h3>
                  <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      <Repeat className="h-3 w-3 mr-1" />
                      {bill.frequency === "MONTHLY" ? "Monthly" : "Yearly"}
                    </Badge>
                    {bill.category && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {bill.category.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Next Payment Date */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Next Payment
                    </span>
                    <span
                      className={`text-sm font-semibold ${getDateColor(
                        bill.nextDate
                      )}`}
                    >
                      {formatNextDate(bill.nextDate)}
                    </span>
                  </div>
                  {bill.wallet && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Wallet
                      </span>
                      <span className="text-xs font-medium">
                        {bill.wallet.name}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
