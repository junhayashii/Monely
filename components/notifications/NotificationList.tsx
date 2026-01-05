"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { markNotificationAsRead, deleteNotification } from "@/app/(dashboard)/notifications/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
};

type NotificationListProps = {
  notifications: Notification[];
};

export default function NotificationList({
  notifications,
}: NotificationListProps) {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const router = useRouter();

  // Format currency values in notification messages
  const formatNotificationMessage = (message: string): string => {
    const currencySymbol = getCurrencySymbol();
    // Replace "R$" with current currency symbol and format numbers
    // Pattern: "R$ 1000" or "R$1000" or just numbers in parentheses or after certain words
    let formatted = message.replace(/R\$\s*(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?)/g, (match, numStr) => {
      const numValue = parseFloat(numStr.replace(/[,\s]/g, ''));
      if (!isNaN(numValue)) {
        return formatCurrency(numValue);
      }
      return match;
    });
    // Also handle standalone large numbers that might be currency (in parentheses or after certain patterns)
    formatted = formatted.replace(/\((\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?)\)/g, (match, numStr) => {
      const numValue = parseFloat(numStr.replace(/[,\s]/g, ''));
      if (!isNaN(numValue) && numValue > 10) {
        return `(${formatCurrency(numValue)})`;
      }
      return match;
    });
    return formatted;
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    router.refresh();
  };

  if (notifications.length === 0) {
    return (
      <Card className="border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 rounded-[2rem]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckCircle2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No notifications yet
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            You'll see notifications here when your budgets are exceeded
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 rounded-[2rem] transition-all ${
            !notification.read
              ? "ring-2 ring-rose-200 dark:ring-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20"
              : ""
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] px-2 py-0"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {formatNotificationMessage(notification.message)}
                    </p>
                    {notification.category && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            borderColor: notification.category.color || undefined,
                            color: notification.category.color || undefined,
                          }}
                        >
                          {notification.category.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs"
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                  {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}



