"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// レスポンスの型を定義
export type ActionResponse = {
  success: boolean;
  message: string;
};

export async function createTransaction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    await prisma.transaction.create({
      data: {
        title: String(formData.get("title")),
        amount: Number(formData.get("amount")),
        date: new Date(String(formData.get("date"))),
      },
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

export async function updateTransaction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    await prisma.transaction.update({
      where: { id },
      data: {
        title: String(formData.get("title")),
        amount: Number(formData.get("amount")),
        date: new Date(String(formData.get("date"))),
      },
    });

    revalidatePath("/transactions");

    // ★ここでも return
    return { success: true, message: "Transaction updated!" };
  } catch (error) {
    console.error(error);
    // ★ここでも return
    return { success: false, message: "Failed to update transaction." };
  }
}

// deleteも同様に修正が必要です
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
