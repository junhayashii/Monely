"use server";

import { CategoryType } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase"; // ★追加
import { revalidatePath, revalidateTag } from "next/cache";
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
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "無効なカラー形式です。"),
});

export type ActionResponse = {
  success: boolean;
  message: string;
};

// 共通ヘルパー関数
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// カテゴリ作成
export async function createCategory(
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthenticatedUser(); // ★取得

  const validatedFields = CategorySchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    budget: formData.get("budget"),
    color: formData.get("color") || "#3b82f6",
  });

  if (!validatedFields.success) {
    return { success: false, message: validatedFields.error.issues[0].message };
  }

  const { name, type, budget, color } = validatedFields.data;

  try {
    await prisma.category.create({
      // ★userId を追加
      data: { name, type, budget, color, userId: user.id },
    });
    revalidatePath("/budgets");
    revalidatePath("/dashboard"); // パスを明示的に指定
    revalidateTag(`categories-${user.id}`, "default");
    revalidateTag(`dashboard-${user.id}`, "default");
    return { success: true, message: "カテゴリを作成しました！" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "作成に失敗しました。" };
  }
}

// カテゴリ更新
export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthenticatedUser(); // ★取得

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
      // ★where に userId を追加
      where: { id, userId: user.id },
      data: { name, type, budget },
    });
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    revalidateTag(`categories-${user.id}`, "default");
    revalidateTag(`dashboard-${user.id}`, "default");
    return { success: true, message: "予算を更新しました！" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "更新に失敗しました。" };
  }
}

// カテゴリ削除
export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser(); // ★取得

    await prisma.category.delete({
      // ★where に userId を追加
      where: { id: id, userId: user.id },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    revalidateTag(`categories-${user.id}`, "default");
    revalidateTag(`dashboard-${user.id}`, "default");

    return { success: true, message: "カテゴリを削除しました。" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "削除に失敗しました。関連する取引が残っている可能性があります。",
    };
  }
}
