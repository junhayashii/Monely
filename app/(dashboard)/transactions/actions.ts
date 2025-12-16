"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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
});

// レスポンスの型を定義
export type ActionResponse = {
  success: boolean;
  message: string;
};

// Create Transactions
export async function createTransaction(
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
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
  const { title, amount, date } = validatedFields.data;

  try {
    await prisma.transaction.create({
      data: { title, amount, date },
    });

    revalidatePath("/transactions");

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
  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
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

  const { title, amount, date } = validatedFields.data;

  try {
    await prisma.transaction.update({
      where: { id },
      data: { title, amount, date },
    });

    revalidatePath("/transactions");
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
    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/transactions");
    return { success: true, message: "Transaction deleted!" };
  } catch (error) {
    return { success: false, message: "Failed to delete transaction." };
  }
}
