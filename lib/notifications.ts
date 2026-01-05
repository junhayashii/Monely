import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * カテゴリの月間支出を計算し、予算を超えているかチェック
 * 予算超過の場合、通知を作成（重複を避ける）
 */
export async function checkBudgetAndNotify(
  userId: string,
  categoryId: string | null,
  transactionDate: Date
): Promise<void> {
  if (!categoryId) return;

  // カテゴリ情報を取得
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  // 予算が設定されていない、またはINCOMEカテゴリの場合はスキップ
  if (!category || !category.budget || category.type === "INCOME") {
    return;
  }

  // 取引が発生した月の開始日と終了日を取得
  const monthStart = startOfMonth(transactionDate);
  const monthEnd = endOfMonth(transactionDate);

  // その月のカテゴリの支出合計を計算
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      categoryId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  // 予算を超えているかチェック
  if (totalSpent > category.budget) {
    // 今月、このカテゴリに対する未読の予算超過通知が既に存在するかチェック
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId,
        categoryId,
        type: "BUDGET_EXCEEDED",
        read: false,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // 既に通知が存在する場合はスキップ（重複を避ける）
    if (existingNotification) {
      return;
    }

    // 通知を作成
    const overAmount = totalSpent - category.budget;
    await prisma.notification.create({
      data: {
        userId,
        categoryId,
        type: "BUDGET_EXCEEDED",
        title: `予算超過: ${category.name}`,
        message: `${
          category.name
        }の予算（${category.budget.toLocaleString()}）を${overAmount.toLocaleString()}超過しました。`,
      },
    });
  }
}


