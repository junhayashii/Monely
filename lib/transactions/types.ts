import { Transaction, Category, Wallet, CategoryType, WalletType } from "@/lib/generated/prisma";

export type TransactionWithRelations = Transaction & {
  category?: Pick<Category, "name" | "type" | "color"> | null;
  wallet?: Pick<Wallet, "name"> | null;
  toWallet?: Pick<Wallet, "name"> | null;
};

export type UISelectableCategory = {
  id: string;
  name: string;
  type: CategoryType;
  color: string | null;
};

export type UISelectableWallet = {
  id: string;
  name: string;
  type: WalletType;
  color: string | null;
  balance?: number;
};

export interface TransactionManagerProps {
  initialTransactions: TransactionWithRelations[];
  categories: UISelectableCategory[];
  wallets: UISelectableWallet[];
  pagination?: React.ReactNode;
}
