"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase"; // ★追加
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GoalSchema = z.object({
  name: z.string().min(1, "目標名は必須です"),
  targetAmount: z.coerce
    .number()
    .positive("目標金額は正の数で入力してください"),
  deadline: z.string().optional(),
});

// 共通ヘルパー
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function createGoal(formData: FormData) {
  const user = await getAuthenticatedUser(); // ★取得

  const validatedFields = GoalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    deadline: formData.get("deadline"),
  });

  if (!validatedFields.success) {
    return { success: false, message: "入力内容が正しくありません" };
  }

  try {
    await prisma.goal.create({
      data: {
        name: validatedFields.data.name,
        targetAmount: validatedFields.data.targetAmount,
        deadline: validatedFields.data.deadline
          ? new Date(validatedFields.data.deadline)
          : undefined,
        currentAmount: 0,
        userId: user.id, // ★userId を追加
      },
    });

    revalidatePath("/goals");
    return { success: true, message: "目標を設定しました！" };
  } catch (error) {
    return { success: false, message: "保存に失敗しました" };
  }
}

export async function updateGoal(id: string, formData: FormData) {
  const user = await getAuthenticatedUser(); // ★取得

  const validatedFields = GoalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    deadline: formData.get("deadline"),
  });

  if (!validatedFields.success) {
    return { success: false, message: "入力内容が正しくありません" };
  }

  try {
    await prisma.goal.update({
      where: { id, userId: user.id }, // ★自分の目標か確認
      data: {
        name: validatedFields.data.name,
        targetAmount: validatedFields.data.targetAmount,
        deadline: validatedFields.data.deadline
          ? new Date(validatedFields.data.deadline)
          : undefined,
      },
    });

    revalidatePath("/goals");
    return { success: true, message: "目標を更新しました！" };
  } catch (error) {
    return { success: false, message: "保存に失敗しました" };
  }
}

export async function deleteGoal(id: string) {
  try {
    const user = await getAuthenticatedUser(); // ★取得
    await prisma.goal.delete({
      where: { id, userId: user.id }, // ★自分の目標だけ消せる
    });
    revalidatePath("/goals");
    return { success: true };
  } catch (error) {
    return { success: false, message: "削除に失敗しました" };
  }
}

export async function addSavings(
  goalId: string,
  amount: number,
  walletId: string
) {
  try {
    const user = await getAuthenticatedUser(); // ★最重要

    await prisma.$transaction(async (tx) => {
      // 1. 指定したウォレットから金額を引く (自分のウォレットか確認)
      await tx.wallet.update({
        where: { id: walletId, userId: user.id }, // ★
        data: {
          balance: { decrement: amount },
        },
      });

      // 2. 目標（Goal）の現在額を増やす (自分の目標か確認)
      await tx.goal.update({
        where: { id: goalId, userId: user.id }, // ★
        data: {
          currentAmount: { increment: amount },
        },
      });
    });

    revalidatePath("/goals");
    revalidatePath("/wallets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `R$ ${amount.toLocaleString()} 貯金しました！`,
    };
  } catch (error: any) {
    console.error("Savings error:", error);
    return { success: false, message: "貯金処理に失敗しました" };
  }
}
