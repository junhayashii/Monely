"use server";

import { CategoryType } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CategorySchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です。")
    .max(20, "名前は20文字以内で入力してください。"),
  type: z.enum(["INCOME", "EXPENSE"], { message: "タイプが不正です。" }),
  budget: z.coerce
    .number({ message: "予算は数値で入力してください。" })
    .min(0, "予算は0以上の値を入力してください。"),
});

export type ActionResponse = {
  success: boolean;
  message: string;
};

// カテゴリ作成
export async function createCategory(
  formData: FormData
): Promise<ActionResponse> {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    budget: formData.get("budget"),
  });

  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const { name, type, budget } = validatedFields.data;

  try {
    await prisma.category.create({
      data: { name, type, budget },
    });
    revalidatePath("/budgets");
    revalidatePath("/"); // ダッシュボード側も更新
    return { success: true, message: "カテゴリを作成しました！" };
  } catch (error) {
    return { success: false, message: "作成に失敗しました。" };
  }
}

// カテゴリ更新
export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    budget: formData.get("budget"),
  });

  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const { name, type, budget } = validatedFields.data;

  try {
    await prisma.category.update({
      where: { id },
      data: { name, type, budget },
    });
    revalidatePath("/budgets");
    revalidatePath("/");
    return { success: true, message: "予算を更新しました！" };
  } catch (error) {
    return { success: false, message: "更新に失敗しました。" };
  }
}

// カテゴリ削除
export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    await prisma.category.delete({
      where: { id: id },
    });

    revalidatePath("/budgets");
    revalidatePath("/");

    // ★ 成功した時の戻り値を追加
    return { success: true, message: "カテゴリを削除しました。" };
  } catch (error) {
    console.error(error);
    // ★ 失敗した時の戻り値を追加
    return {
      success: false,
      message: "削除に失敗しました。関連する取引が残っている可能性があります。",
    };
  }
}
