"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GoalSchema = z.object({
  name: z.string().min(1, "目標名は必須です"),
  targetAmount: z.coerce
    .number()
    .positive("目標金額は正の数で入力してください"),
  deadline: z.string().optional(),
});

export async function createGoal(formData: FormData) {
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
      },
    });

    revalidatePath("/goals");
    return { success: true, message: "目標を設定しました！" };
  } catch (error) {
    return { success: false, message: "保存に失敗しました" };
  }
}

export async function updateGoal(id: string, formData: FormData) {
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
      where: { id },
      data: {
        name: validatedFields.data.name,
        targetAmount: validatedFields.data.targetAmount,
        deadline: validatedFields.data.deadline
          ? new Date(validatedFields.data.deadline)
          : undefined,
        currentAmount: 0,
      },
    });

    revalidatePath("/goals");
    return { success: true, message: "目標を設定しました！" };
  } catch (error) {
    return { success: false, message: "保存に失敗しました" };
  }
}

export async function deleteGoal(id: string) {
  try {
    await prisma.goal.delete({ where: { id } });
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
    // prisma.$transaction を使って、両方の更新をセットで行います
    await prisma.$transaction(async (tx) => {
      // 1. 指定したウォレットから金額を引く
      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: { decrement: amount },
        },
      });

      // 2. 目標（Goal）の現在額を増やす
      await tx.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount },
        },
      });
    });

    // 画面のデータを最新に更新する
    revalidatePath("/goals");
    revalidatePath("/wallets");

    return {
      success: true,
      message: `R$ ${amount.toLocaleString()} 貯金しました！`,
    };
  } catch (error: any) {
    console.error("Savings error:", error);
    return { success: false, message: "貯金処理に失敗しました" };
  }
}
