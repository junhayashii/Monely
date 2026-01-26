export function parseTransactionSearchParams(params: {
  q?: string;
  month?: string;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  walletId?: string;
  page?: string;
}) {
  return {
    q: params.q?.trim() || undefined,
    month: params.month,
    type: params.type,
    categoryId: params.categoryId,
    walletId: params.walletId,
    page: Math.max(1, Number(params.page) || 1),
  };
}
