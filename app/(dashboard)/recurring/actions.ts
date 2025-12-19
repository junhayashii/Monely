"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertRecurringBill(
  id: string | undefined,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const frequency = formData.get("frequency") as string; // "MONTHLY" or "YEARLY"
  const startDate = new Date(formData.get("startDate") as string);
  const walletId = formData.get("walletId") as string;
  const categoryId = formData.get("categoryId") as string;

  try {
    if (id) {
      // 更新
      await prisma.recurringBill.update({
        where: { id },
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
      // 新規作成
      await prisma.recurringBill.create({
        data: {
          name,
          amount,
          frequency,
          startDate,
          nextDate: startDate,
          walletId,
          categoryId: categoryId,
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
    await prisma.recurringBill.delete({ where: { id } });
    revalidatePath("/recurring");
    return { success: true, message: "Deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete" };
  }
}

export async function processRecurringPayment(billId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. サブスク情報の取得
      const bill = await tx.recurringBill.findUnique({
        where: { id: billId },
      });

      if (!bill) throw new Error("Bill not found");
      if (!bill.categoryId) {
        throw new Error("このサブスクにはカテゴリが設定されていません。");
      }

      // 2. ウォレットから残高を引く
      await tx.wallet.update({
        where: { id: bill.walletId },
        data: { balance: { decrement: bill.amount } },
      });

      // 3. 取引履歴（Transaction）を作成
      await tx.transaction.create({
        data: {
          title: `Fixed Cost: ${bill.name}`,
          amount: bill.amount,
          date: new Date(),
          walletId: bill.walletId,
          categoryId: bill.categoryId,
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
        where: { id: billId },
        data: { nextDate },
      });
    });

    revalidatePath("/recurring");
    revalidatePath("/wallets");
    return { success: true, message: "Payment processed successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
