"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase"; // ★追加
import { revalidatePath } from "next/cache";
import { z } from "zod";

const WalletSchema = z.object({
  name: z.string().min(1, "名前は必須です。"),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD", "E_MONEY"]),
  initialBalance: z.coerce.number(),
});

export type ActionResponse = { success: boolean; message: string };

// 共通ヘルパー関数
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function upsertWallet(
  id: string | undefined,
  formData: FormData
): Promise<ActionResponse> {
  // 1. ユーザーの取得
  const user = await getAuthenticatedUser();

  const validated = WalletSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    initialBalance: formData.get("initialBalance"),
  });

  if (!validated.success) return { success: false, message: "入力が不正です" };

  const { name, type, initialBalance } = validated.data;

  try {
    if (id) {
      // 編集時：自分の財布か確認しながら更新
      await prisma.wallet.update({
        where: { id, userId: user.id }, // ★ userId を追加
        data: {
          name,
          type,
          balance: initialBalance,
        },
      });
    } else {
      // 新規作成時：userId を含めて作成
      await prisma.wallet.create({
        data: {
          name,
          type,
          balance: initialBalance,
          userId: user.id, // ★ userId を追加
        },
      });
    }
    revalidatePath("/wallets");
    revalidatePath("/dashboard"); // ダッシュボードの合計残高に影響するため
    return { success: true, message: "Walletを保存しました" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "エラーが発生しました" };
  }
}

export async function deleteWallet(id: string): Promise<ActionResponse> {
  try {
    // 2. 削除時：ユーザーチェック
    const user = await getAuthenticatedUser();

    // deleteMany または findFirst で確認してから削除（セキュリティのため）
    await prisma.wallet.delete({
      where: {
        id,
        userId: user.id, // ★ 自分の財布しか消せないようにする
      },
    });

    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    return { success: true, message: "Walletを削除しました" };
  } catch (error) {
    return {
      success: false,
      message: "削除に失敗しました（取引データがある可能性があります）",
    };
  }
}
