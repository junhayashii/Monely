"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { userAgent } from "next/server";
import { z } from "zod";

// Zod スキーマの定義
const TransactionSchema = z.object({
  // タイトル: 必須、文字列、1文字以上、50文字以下
  title: z.string().min(1, { message: "タイトルは必須です。" }).max(50),
  // 金額: 必須、数値に変換、正の値であること
  amount: z.coerce
    .number({ message: "金額は数値で入力してください。" })
    .positive({ message: "金額は正の値である必要があります。" }),
  // 日付: 必須、日付型に変換
  date: z.coerce.date({ message: "日付が不正です。" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  walletId: z.string().min(1, { message: "Wallet is required" }),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// レスポンスの型を定義
export type ActionResponse = {
  success: boolean;
  message: string;
};

// Create Transactions
export async function createTransaction(
  formData: FormData
): Promise<ActionResponse> {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (e) {
    return { success: false, message: "ログインが必要です。" };
  }

  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    walletId: formData.get("walletId"),
  };

  // スキーマを使って検証を実行
  const validatedFields = TransactionSchema.safeParse(rawData);

  // 検証失敗
  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.issues
      .map((issue) => issue.message)
      .join(" / ");

    return {
      success: false,
      message: errorMessage || "入力データが不正です。",
    };
  }

  // 検証成功: 安全なデータを取り出す
  const { title, amount, date, categoryId, walletId } = validatedFields.data;

  try {
    // Prismaのトランザクションを開始
    await prisma.$transaction(async (tx) => {
      // 1. 取引を作成
      await tx.transaction.create({
        data: { title, amount, date, categoryId, walletId, userId: user.id },
      });

      // 2. カテゴリを取得して「収入」か「支出」かを確認
      const category = await tx.category.findUnique({
        where: { id: categoryId },
      });

      // 3. 増減額を決定 (支出ならマイナス)
      const amountChange = category?.type === "EXPENSE" ? -amount : amount;

      // 4. Walletの残高を更新
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: amountChange, // 数値を加算（マイナスの場合は減算になる）
          },
        },
      });
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/wallets");

    // ★重要: 成功時はここで必ず return する
    return { success: true, message: "Transaction created!" };
  } catch (error) {
    console.error(error);
    // ★重要: エラー時もここで必ず return する
    return { success: false, message: "Failed to create transaction." };
  }
}

// Update Transaction
export async function updateTransaction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthenticatedUser();

  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    walletId: formData.get("walletId"),
  };

  const validatedFields = TransactionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.issues
      .map((issue) => issue.message)
      .join(" / ");

    return {
      success: false,
      message: errorMessage || "入力データが不正です。",
    };
  }

  const { title, amount, date, categoryId, walletId } = validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      // A. 【古い状態の取り消し】
      const oldTx = await tx.transaction.findFirst({
        where: { id, userId: user.id },
        include: { category: true },
      });
      if (!oldTx) throw new Error("Old transaction not found");

      if (oldTx.walletId) {
        const oldAmountRestore =
          oldTx.category.type === "EXPENSE" ? oldTx.amount : -oldTx.amount;
        await tx.wallet.update({
          where: { id: oldTx.walletId, userId: user.id },
          data: { balance: { increment: oldAmountRestore } },
        });
      }

      // B. 【新しい状態の適用】
      const newCategory = await tx.category.findUnique({
        where: { id: categoryId },
      });
      const newAmountChange =
        newCategory?.type === "EXPENSE" ? -amount : amount;

      await tx.wallet.update({
        where: { id: walletId }, // 新しいWalletIDに対して
        data: { balance: { increment: newAmountChange } },
      });

      // C. 【取引データの更新】
      await tx.transaction.update({
        where: { id, userId: user.id },
        data: { title, amount, date, categoryId, walletId },
      });
    });

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    return { success: true, message: "Transaction updated!" };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      success: false,
      message: "データベース操作中に予期せぬエラーが発生しました。",
    };
  }
}

// Delete Transaction
export async function deleteTransaction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();

    await prisma.$transaction(async (tx) => {
      // 1. 消す前に、その取引の金額、WalletID、カテゴリ情報を取得
      const transaction = await tx.transaction.findUnique({
        where: { id, userId: user.id },
        include: { category: true },
      });

      if (!transaction) throw new Error("Transaction not found");

      // 2. 残高を元に戻す計算 (支出を消す = 残高増、収入を消す = 残高減)
      const amountToRestore =
        transaction.category.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;

      // 3. Walletの更新
      await tx.wallet.update({
        where: { id: transaction.walletId || undefined, userId: user.id },
        data: { balance: { increment: amountToRestore } },
      });

      // 4. 取引の削除
      await tx.transaction.delete({ where: { id, userId: user.id } });
    });

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    return { success: true, message: "Transaction deleted!" };
  } catch (error) {
    return { success: false, message: "Failed to delete transaction." };
  }
}
