import { Category, Wallet } from "@/lib/generated/prisma";

export type Transactions = {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
};

export type TransactionFilterProps = {
  categories: Pick<Category, "id" | "name">[];
  wallets: Pick<Wallet, "id" | "name">[];
};
