"use client";

import { useState, useTransition } from "react";
import { Plus, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddEditModal from "@/components/AddEditModal";
import RecurringForm from "./RecurringForm";
import { processRecurringPayment } from "@/app/(dashboard)/recurring/actions";
import { toast } from "sonner";

function RecurringList({
  bills,
  wallets,
  categories,
}: {
  bills: any[];
  wallets: any[];
  categories: any[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (bill: any) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedBill(null);
    setIsModalOpen(true);
  };
  const handlePay = (e: React.MouseEvent, billId: string) => {
    e.stopPropagation(); // 編集モーダルが開くのを防ぐ
    if (!confirm("Process this payment now?")) return;

    startTransition(async () => {
      const result = await processRecurringPayment(billId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const totalMonthly = bills
    .filter((b) => b.frequency === "MONTHLY")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-muted-foreground">Monthly Total</p>
          <h2 className="text-3xl font-bold">
            R$ {totalMonthly.toLocaleString()}
          </h2>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Bill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bills.map((bill) => (
          <Card
            key={bill.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleEdit(bill)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{bill.name}</CardTitle>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {bill.category?.name || "No Category"}
              </p>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                R$ {bill.amount.toLocaleString()}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{bill.frequency}</span>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Next: {new Date(bill.nextDate).toLocaleDateString()}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={(e) => handlePay(e, bill.id)}
                    disabled={isPending}
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddEditModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={selectedBill ? "Edit Bill" : "Add Recurring Bill"}
        description="Manage your subscriptions and fixed expenses."
      >
        <RecurringForm
          bill={selectedBill}
          wallets={wallets}
          categories={categories}
          onSuccess={() => setIsModalOpen(false)}
        />
      </AddEditModal>
    </div>
  );
}

export default RecurringList;
