"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase"; // ★追加
import { revalidatePath } from "next/cache";
import { checkBudgetAndNotify } from "@/lib/notifications";

// 共通ヘルパー
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function upsertRecurringBill(
  id: string | undefined,
  formData: FormData
) {
  const user = await getAuthenticatedUser(); // ★取得

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const frequency = formData.get("frequency") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const walletId = formData.get("walletId") as string;
  const categoryId = formData.get("categoryId") as string;

  try {
    if (id) {
      // 更新時：自分のデータか確認
      await prisma.recurringBill.update({
        where: { id, userId: user.id }, // ★追加
        data: {
          name,
          amount,
          frequency,
          startDate,
          walletId,
          categoryId,
          nextDate: startDate,
        },
      });
    } else {
      // 新規作成時：userId を紐付け
      await prisma.recurringBill.create({
        data: {
          name,
          amount,
          frequency,
          startDate,
          nextDate: startDate,
          walletId,
          categoryId: categoryId,
          userId: user.id, // ★追加
        },
      });
    }

    revalidatePath("/recurring");
    return { success: true, message: "Recurring bill saved!" };
  } catch (error) {
    return { success: false, message: "Failed to save recurring bill" };
  }
}

export async function deleteRecurringBill(id: string) {
  try {
    const user = await getAuthenticatedUser(); // ★取得
    await prisma.recurringBill.delete({
      where: { id, userId: user.id }, // ★自分の物だけ消せる
    });
    revalidatePath("/recurring");
    return { success: true, message: "Deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete" };
  }
}

export async function processRecurringPayment(billId: string) {
  try {
    const user = await getAuthenticatedUser(); // ★重要

    await prisma.$transaction(async (tx) => {
      // 1. サブスク情報の取得（自分のものか確認）
      const bill = await tx.recurringBill.findFirst({
        // findUnique ではなく findFirst
        where: { id: billId, userId: user.id }, // ★追加
      });

      if (!bill) throw new Error("Bill not found");
      if (!bill.categoryId) {
        throw new Error("このサブスクにはカテゴリが設定されていません。");
      }

      // 2. ウォレットから残高を引く（自分のウォレットか確認）
      await tx.wallet.update({
        where: { id: bill.walletId, userId: user.id }, // ★追加
        data: { balance: { decrement: bill.amount } },
      });

      // 3. 取引履歴（Transaction）を作成 ★ここが最も重要
      await tx.transaction.create({
        data: {
          title: `Fixed Cost: ${bill.name}`,
          amount: bill.amount,
          date: new Date(),
          walletId: bill.walletId,
          categoryId: bill.categoryId,
          userId: user.id, // ★これを忘れるとダッシュボードに出ません！
        },
      });

      // 4. 次回支払日を更新する
      const nextDate = new Date(bill.nextDate);
      if (bill.frequency === "MONTHLY") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      await tx.recurringBill.update({
        where: { id: billId, userId: user.id }, // ★追加
        data: { nextDate },
      });
    });

    // 予算超過チェックと通知作成
    if (bill.categoryId) {
      await checkBudgetAndNotify(user.id, bill.categoryId, new Date());
    }

    revalidatePath("/recurring");
    revalidatePath("/wallets");
    revalidatePath("/dashboard"); // ★追加
    return { success: true, message: "Payment processed successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
