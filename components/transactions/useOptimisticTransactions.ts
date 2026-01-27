import { useOptimistic } from "react";
import { TransactionWithRelations } from "@/lib/transactions/types";

type OptimisticAction =
  | { type: "create"; transaction: TransactionWithRelations }
  | {
      type: "update";
      transaction: Partial<TransactionWithRelations> & { id: string };
    }
  | { type: "delete"; id: string };

export function useOptimisticTransactions(initial: TransactionWithRelations[]) {
  return useOptimistic<TransactionWithRelations[], OptimisticAction>(
    initial,
    (state, action) => {
      switch (action.type) {
        case "create":
          return [action.transaction, ...state];
        case "update":
          return state.map((t) =>
            t.id === action.transaction.id ? { ...t, ...action.transaction } : t
          );
        case "delete":
          return state.filter((t) => t.id !== action.id);
        default:
          return state;
      }
    }
  );
}
