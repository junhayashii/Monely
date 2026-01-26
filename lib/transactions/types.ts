import { Transaction, Category, Wallet } from "@/lib/generated/prisma";

export type TransactionWithRelations = Transaction & {
  category?: Pick<Category, "name" | "type" | "color"> | null;
  wallet?: Pick<Wallet, "name"> | null;
  toWallet?: Pick<Wallet, "name"> | null;
};

export interface TransactionManagerProps {
  initialTransactions: TransactionWithRelations[];
  categories: Category[];
  wallets: Wallet[];
  pagination?: React.ReactNode;
}
