"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const WalletSchema = z.object({
  name: z.string().min(1, "名前は必須です。"),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD", "E_MONEY"]),
  initialBalance: z.coerce.number(),
});

export type ActionResponse = { success: boolean; message: string };

export async function upsertWallet(
  id: string | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const validated = WalletSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    initialBalance: formData.get("initialBalance"),
  });

  if (!validated.success) return { success: false, message: "入力が不正です" };

  // バリデーション済みのデータを取り出す
  const { name, type, initialBalance } = validated.data;

  try {
    if (id) {
      // 編集時
      await prisma.wallet.update({
        where: { id },
        data: {
          name,
          type,
          balance: initialBalance, // ★ initialBalance を balance にマッピング
        },
      });
    } else {
      // 新規作成時
      await prisma.wallet.create({
        data: {
          name,
          type,
          balance: initialBalance, // ★ ここも同様
        },
      });
    }
    revalidatePath("/wallets");
    return { success: true, message: "Walletを保存しました" };
  } catch (error) {
    console.error(error); // ターミナルに詳細なエラーを出す
    return { success: false, message: "エラーが発生しました" };
  }
}

export async function deleteWallet(id: string): Promise<ActionResponse> {
  try {
    await prisma.wallet.delete({ where: { id } });
    revalidatePath("/wallets");
    return { success: true, message: "Walletを削除しました" };
  } catch (error) {
    return {
      success: false,
      message: "削除に失敗しました（取引データがある可能性があります）",
    };
  }
}
