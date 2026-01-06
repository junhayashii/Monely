"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Landmark,
  Wallet as WalletIcon,
  Coins,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface WalletCardProps {
  name: string;
  type: string;
  balance: number;
  isSelected?: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
}

interface TypeConfig {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  darkGradient: string;
  badgeColor: string;
}

const typeConfig: Record<string, TypeConfig> = {
  CASH: {
    icon: Coins,
    gradient: "from-orange-200 via-orange-300 to-amber-300",
    darkGradient: "from-orange-800/40 via-orange-700/40 to-amber-700/40",
    badgeColor:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  },
  BANK: {
    icon: Landmark,
    gradient: "from-blue-200 via-indigo-200 to-blue-300",
    darkGradient: "from-blue-800/40 via-indigo-800/40 to-blue-700/40",
    badgeColor:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  CREDIT_CARD: {
    icon: CreditCard,
    gradient: "from-slate-300 via-slate-400 to-slate-500",
    darkGradient: "from-slate-700/50 via-slate-600/50 to-slate-800/50",
    badgeColor:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  E_MONEY: {
    icon: WalletIcon,
    gradient: "from-emerald-200 via-green-300 to-teal-300",
    darkGradient: "from-emerald-800/40 via-green-700/40 to-teal-700/40",
    badgeColor:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
};

// カード番号風の表示を生成（ウォレット名からハッシュ）
function generateCardNumber(name: string): string {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const last4 = String(hash % 10000).padStart(4, "0");
  return `**** **** **** ${last4}`;
}

function WalletCard({
  name,
  type,
  balance,
  isSelected = false,
  onSelect,
  onEdit,
}: WalletCardProps) {
  const { formatCurrency } = useCurrency();
  const Config = typeConfig[type] || typeConfig.CASH;
  const cardNumber = generateCardNumber(name);

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        isSelected
          ? "scale-102 z-10"
          : "hover:scale-[1.01] hover:-translate-y-1"
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          "relative h-44 w-full rounded-xl p-4 shadow-lg overflow-hidden",
          `bg-linear-to-br ${Config.gradient}`,
          `dark:bg-linear-to-br dark:${Config.darkGradient}`,
          isSelected
            ? "ring-2 ring-indigo-400 ring-offset-1 shadow-xl"
            : "shadow-md"
        )}
      >
        {/* 装飾的な背景パターン */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* 3点メニューボタン */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 h-7 w-7 text-slate-700 dark:text-slate-200",
            "hover:bg-white/30 dark:hover:bg-white/10"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(e);
          }}
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>

        {/* カードコンテンツ */}
        <div className="relative h-full flex flex-col justify-between text-slate-800 dark:text-slate-100">
          {/* 上部: アイコンとタイプバッジ */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/40 dark:bg-white/10 backdrop-blur-sm">
                <Config.icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "border text-xs font-semibold px-2 py-0.5",
                  Config.badgeColor
                )}
              >
                {type.replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* 中央: 名前と金額 */}
          <div className="space-y-1">
            <p className="text-xs font-medium opacity-80 tracking-wide">
              {name}
            </p>
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrency(balance)}
            </p>
          </div>

          {/* 下部: カード番号風 */}
          <div>
            <p className="text-xs font-mono font-semibold tracking-widest opacity-70">
              {cardNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletCard;
