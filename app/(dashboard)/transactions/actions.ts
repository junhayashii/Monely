"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- 1. Zod スキーマの修正 ---
// categoryId と toWalletId はどちらかが入っていれば良いので optional にします
const TransactionSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です。" }).max(50),
  amount: z.coerce
    .number({ message: "金額は数値で入力してください。" })
    .positive({ message: "金額は正の値である必要があります。" }),
  date: z.coerce.date({ message: "日付が不正です。" }),
  walletId: z.string().min(1, { message: "Wallet is required" }),
  categoryId: z.string().optional().nullable(), // min(1)を削除
  toWalletId: z.string().optional().nullable(),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export type ActionResponse = { success: boolean; message: string };

// --- 2. Create Transaction ---
export async function createTransaction(
  formData: FormData
): Promise<ActionResponse> {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch {
    return { success: false, message: "ログインが必要です。" };
  }

  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    walletId: formData.get("walletId"),
    categoryId: formData.get("categoryId") || null, // 空文字ならnullにする
    toWalletId: formData.get("toWalletId") || null,
  };

  const validatedFields = TransactionSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.issues.map((i) => i.message).join(" / "),
    };
  }

  const { title, amount, date, categoryId, walletId, toWalletId } =
    validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 取引作成
      await tx.transaction.create({
        data: {
          title,
          amount,
          date,
          userId: user.id,
          walletId,
          categoryId: categoryId || null,
          toWalletId: toWalletId || null,
        },
      });

      // 残高更新ロジック
      if (toWalletId) {
        // 振替の場合
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amount } },
        });
      } else if (categoryId) {
        // 通常の収支の場合
        const category = await tx.category.findUnique({
          where: { id: categoryId },
        });
        const change = category?.type === "INCOME" ? amount : -amount;
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: change } },
        });
      }
    });

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    return { success: true, message: "Transaction created!" };
  } catch (error) {
    console.error("CREATE ERROR:", error);
    return { success: false, message: "Failed to create." };
  }
}

// --- 3. Update Transaction ---
export async function updateTransaction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthenticatedUser();

  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    walletId: formData.get("walletId"),
    categoryId: formData.get("categoryId") || null,
    toWalletId: formData.get("toWalletId") || null,
  };

  const validatedFields = TransactionSchema.safeParse(rawData);
  if (!validatedFields.success)
    return { success: false, message: "入力データ不正" };

  const { title, amount, date, categoryId, walletId, toWalletId } =
    validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!oldTx) throw new Error("NotFound");

      // A. 旧データの残高戻し
      if (oldTx.toWalletId) {
        await tx.wallet.update({
          where: { id: oldTx.walletId! },
          data: { balance: { increment: oldTx.amount } },
        });
        await tx.wallet.update({
          where: { id: oldTx.toWalletId },
          data: { balance: { decrement: oldTx.amount } },
        });
      } else if (oldTx.categoryId) {
        const restore =
          oldTx.category?.type === "INCOME" ? -oldTx.amount : oldTx.amount;
        await tx.wallet.update({
          where: { id: oldTx.walletId! },
          data: { balance: { increment: restore } },
        });
      }

      // B. 新データの残高適用
      if (toWalletId) {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amount } },
        });
      } else if (categoryId) {
        const category = await tx.category.findUnique({
          where: { id: categoryId },
        });
        const change = category?.type === "INCOME" ? amount : -amount;
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: change } },
        });
      }

      // C. 取引データ更新
      await tx.transaction.update({
        where: { id, userId: user.id },
        data: { title, amount, date, categoryId, walletId, toWalletId },
      });
    });

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    return { success: true, message: "Transaction updated!" };
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return { success: false, message: "Update failed." };
  }
}

// --- 4. Delete Transaction ---
export async function deleteTransaction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!transaction) throw new Error("Not found");

      if (transaction.toWalletId) {
        await tx.wallet.update({
          where: { id: transaction.walletId! },
          data: { balance: { increment: transaction.amount } },
        });
        await tx.wallet.update({
          where: { id: transaction.toWalletId },
          data: { balance: { decrement: transaction.amount } },
        });
      } else if (transaction.categoryId) {
        const restore =
          transaction.category?.type === "INCOME"
            ? -transaction.amount
            : transaction.amount;
        await tx.wallet.update({
          where: { id: transaction.walletId! },
          data: { balance: { increment: restore } },
        });
      }

      await tx.transaction.delete({ where: { id, userId: user.id } });
    });

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    return { success: true, message: "Deleted!" };
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return { success: false, message: "Delete failed." };
  }
}
