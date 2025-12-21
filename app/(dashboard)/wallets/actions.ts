"use server";

import { WalletType } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. スキーマの拡張
const WalletSchema = z.object({
  name: z.string().min(1, "名前は必須です。"),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD", "E_MONEY"]),
  initialBalance: z.coerce.number(),
  // クレジットカード用（省略可能）
  limit: z.coerce.number().optional().nullable(),
  closingDay: z.coerce.number().min(1).max(31).optional().nullable(),
  paymentDay: z.coerce.number().min(1).max(31).optional().nullable(),
});

export type ActionResponse = { success: boolean; message: string };

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
  const user = await getAuthenticatedUser();

  const validated = WalletSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    initialBalance: formData.get("initialBalance"),
    limit: formData.get("limit"),
    closingDay: formData.get("closingDay"),
    paymentDay: formData.get("paymentDay"),
  });

  if (!validated.success) {
    console.error(validated.error);
    return { success: false, message: "入力が不正です" };
  }

  const { name, type, initialBalance, limit, closingDay, paymentDay } =
    validated.data;

  // クレジットカードの場合、入力された金額を「負債（マイナス）」として保存するロジック
  // 例：利用額 50,000 と入れたら、内部的には -50000 になる
  const finalBalance =
    type === "CREDIT_CARD" ? -Math.abs(initialBalance) : initialBalance;

  try {
    const data = {
      name,
      type: type as WalletType,
      balance: finalBalance,
      limit: type === "CREDIT_CARD" ? limit : null,
      closingDay: type === "CREDIT_CARD" ? closingDay : null,
      paymentDay: type === "CREDIT_CARD" ? paymentDay : null,
    };

    if (id) {
      await prisma.wallet.update({
        where: { id, userId: user.id },
        data,
      });
    } else {
      await prisma.wallet.create({
        data: {
          ...data,
          userId: user.id,
        },
      });
    }

    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    return { success: true, message: "Walletを保存しました" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "エラーが発生しました" };
  }
}

export async function deleteWallet(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    await prisma.wallet.delete({
      where: { id, userId: user.id },
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
