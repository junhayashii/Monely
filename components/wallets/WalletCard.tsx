import { Card, CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Landmark,
  Wallet as WalletIcon,
  Coins,
} from "lucide-react";

interface WalletCardProps {
  name: string;
  type: string;
  balance: number;
  onClick: () => void;
}

const typeConfig: any = {
  CASH: { icon: Coins, color: "text-orange-500" },
  BANK: { icon: Landmark, color: "text-blue-500" },
  CREDIT_CARD: { icon: CreditCard, color: "text-purple-500" },
  E_MONEY: { icon: WalletIcon, color: "text-green-500" },
};

function WalletCard({ name, type, balance, onClick }: WalletCardProps) {
  const Config = typeConfig[type] || typeConfig.CASH;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg bg-slate-100 ${Config.color}`}>
            <Config.icon size={24} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {type}
          </span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{name}</p>
          <p className="text-2xl font-bold">R$ {balance.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default WalletCard;
