"use server";

import { CategoryType } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertCategory(data: {
  id?: string;
  name: string;
  type: CategoryType;
  budget: number;
}) {
  if (data.id) {
    // 編集
    await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        type: data.type,
        budget: data.budget,
      },
    });
  } else {
    // 新規作成
    await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        budget: data.budget,
      },
    });
  }

  revalidatePath("/budgets");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id: id },
  });
  revalidatePath("/budgets");
  revalidatePath("/");
}
