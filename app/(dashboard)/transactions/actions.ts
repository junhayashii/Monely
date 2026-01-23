"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { checkBudgetAndNotify } from "@/lib/notifications";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

// --- 1. Zod スキーマの修正 ---
// categoryId と toWalletId はどちらかが入っていれば良いので optional にします
const TransactionSchema = z.object({
  title: z.string().min(1, { message: "タイトルは必須です。" }).max(50),
  amount: z.coerce
    .number({ message: "金額は数値で入力してください。" })
    .positive({ message: "金額は正の値である必要があります。" }),
  date: z.coerce.date({ message: "日付が不正です。" }),
  walletId: z.string().min(1, { message: "Wallet is required" }),
  categoryId: z.string().optional().nullable(), // min(1)を削除
  toWalletId: z.string().optional().nullable(),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export type ActionResponse = { success: boolean; message: string };

// --- 2. Create Transaction ---
export async function createTransaction(
  formData: FormData
): Promise<ActionResponse> {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch {
    return { success: false, message: "ログインが必要です。" };
  }

  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    walletId: formData.get("walletId"),
    categoryId: formData.get("categoryId") || null, // 空文字ならnullにする
    toWalletId: formData.get("toWalletId") || null,
  };

  const validatedFields = TransactionSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.issues.map((i) => i.message).join(" / "),
    };
  }

  const { title, amount, date, categoryId, walletId, toWalletId } =
    validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      // 取引作成
      await tx.transaction.create({
        data: {
          title,
          amount,
          date,
          userId: user.id,
          walletId,
          categoryId: categoryId || null,
          toWalletId: toWalletId || null,
        },
      });

      // 残高更新ロジック
      if (toWalletId) {
        // 振替の場合
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amount } },
        });
      } else if (categoryId) {
        // 通常の収支の場合
        const category = await tx.category.findUnique({
          where: { id: categoryId },
        });
        const change = category?.type === "INCOME" ? amount : -amount;
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: change } },
        });
      }
    });

    // 予算超過チェックと通知作成（EXPENSEカテゴリの場合のみ）
    if (categoryId) {
      await checkBudgetAndNotify(user.id, categoryId, date);
    }

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    revalidateTag(`wallets-${user.id}`, "default");
    revalidateTag(`dashboard-${user.id}`, "default");
    return { success: true, message: "Transaction created!" };
  } catch (error) {
    console.error("CREATE ERROR:", error);
    return { success: false, message: "Failed to create." };
  }
}

// --- 3. Update Transaction ---
export async function updateTransaction(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const user = await getAuthenticatedUser();

  const rawData = {
    title: formData.get("title"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    walletId: formData.get("walletId"),
    categoryId: formData.get("categoryId") || null,
    toWalletId: formData.get("toWalletId") || null,
  };

  const validatedFields = TransactionSchema.safeParse(rawData);
  if (!validatedFields.success)
    return { success: false, message: "入力データ不正" };

  const { title, amount, date, categoryId, walletId, toWalletId } =
    validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!oldTx) throw new Error("NotFound");

      // A. 旧データの残高戻し
      if (oldTx.toWalletId) {
        await tx.wallet.update({
          where: { id: oldTx.walletId! },
          data: { balance: { increment: oldTx.amount } },
        });
        await tx.wallet.update({
          where: { id: oldTx.toWalletId },
          data: { balance: { decrement: oldTx.amount } },
        });
      } else if (oldTx.categoryId) {
        const restore =
          oldTx.category?.type === "INCOME" ? -oldTx.amount : oldTx.amount;
        await tx.wallet.update({
          where: { id: oldTx.walletId! },
          data: { balance: { increment: restore } },
        });
      }

      // B. 新データの残高適用
      if (toWalletId) {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amount } },
        });
      } else if (categoryId) {
        const category = await tx.category.findUnique({
          where: { id: categoryId },
        });
        const change = category?.type === "INCOME" ? amount : -amount;
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: change } },
        });
      }

      // C. 取引データ更新
      await tx.transaction.update({
        where: { id, userId: user.id },
        data: { title, amount, date, categoryId, walletId, toWalletId },
      });
    });

    // 予算超過チェックと通知作成（EXPENSEカテゴリの場合のみ）
    if (categoryId) {
      await checkBudgetAndNotify(user.id, categoryId, date);
    }

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    revalidateTag(`wallets-${user.id}`, "default");
    revalidateTag(`dashboard-${user.id}`, "default");
    return { success: true, message: "Transaction updated!" };
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return { success: false, message: "Update failed." };
  }
}

// --- 4. Delete Transaction ---
export async function deleteTransaction(id: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser();
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!transaction) throw new Error("Not found");

      if (transaction.toWalletId) {
        await tx.wallet.update({
          where: { id: transaction.walletId! },
          data: { balance: { increment: transaction.amount } },
        });
        await tx.wallet.update({
          where: { id: transaction.toWalletId },
          data: { balance: { decrement: transaction.amount } },
        });
      } else if (transaction.categoryId) {
        const restore =
          transaction.category?.type === "INCOME"
            ? -transaction.amount
            : transaction.amount;
        await tx.wallet.update({
          where: { id: transaction.walletId! },
          data: { balance: { increment: restore } },
        });
      }

      await tx.transaction.delete({ where: { id, userId: user.id } });
    });

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    revalidateTag(`wallets-${user.id}`, "default");
    revalidateTag(`dashboard-${user.id}`, "default");
    return { success: true, message: "Deleted!" };
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return { success: false, message: "Delete failed." };
  }
}

// --- Helper: Suggest Category ---
// --- Helper: Suggest Category ---
// Key: Primary category concept (used for matching with keywords)
// Keywords: List of terms to look for in the transaction title
const KEYWORD_MAP: Record<string, { keywords: string[], synonyms: string[] }> = {
  Food: { 
    keywords: ["Pao de Acucar", "Carrefour", "Extra", "Assai", "Supermercado", "Hortifruti", "Mambo", "Sukiya", "LXS PRESENTES"], 
    synonyms: ["Alimentação", "Mercado", "Comida", "Food"] 
  },
  Dining: { 
    keywords: ["Ifood", "McDonalds", "Starbucks", "Restaurante", "Cafe", "Padaria", "Burger King", "Outback", "Sukiya"], 
    synonyms: ["Restaurantes", "Dining Out", "Eating Out", "Lanches"] 
  },
  Transport: { 
    keywords: ["Uber", "99App", "Gasolina", "Posto", "Metrô", "Onibus", "Sem Parar", "Localiza", "ALLPARK"], 
    synonyms: ["Transporte", "Combustível", "Viagem", "Transport"] 
  },
  Housing: { 
    keywords: ["Condominio", "Aluguel", "Enel", "Sabesp", "Ultragaz", "Energia", "Gas", "CPFL", "EDP"], 
    synonyms: ["Moradia", "House", "Rent", "Housing", "Living"] 
  },
  Utilities: {
    keywords: ["Telefonia", "Vivo", "Claro", "Tim", "Oi", "NET", "Sky", "Telefonica", "Internet"],
    synonyms: ["Utilities", "Public Services", "Contas", "Serviços Públicos"]
  },
  Entertainment: { 
    keywords: ["Netflix", "Spotify", "Youtube", "iCloud", "Google", "Amazon Prime", "DisneyPlus", "STEAM", "PlayStation"], 
    synonyms: ["Entertenimento", "Entertainment", "Lazer", "Serviços"] 
  },
  Health: { 
    keywords: ["Farmacia", "Droga Raia", "Drogasil", "Unimed", "Hospital", "Laboratorio", "Odonto"], 
    synonyms: ["Saúde", "Health", "Farmácia", "Médico"] 
  },
  Shopping: {
    keywords: ["Renner", "C&A", "Riachuelo", "Zara", "Mercado Livre", "Shopee", "Shein", "Magalu", "Casas Bahia"],
    synonyms: ["Shopping", "Compras", "Moda", "Vestuário"]
  },
  Pet: {
    keywords: ["Vet", "Veterinario", "Petz", "Cobasi", "Ração", "VETDAKTARI"],
    synonyms: ["Pet", "Animais", "Animal"]
  },
  Salary: {
    keywords: ["Salario", "Salary", "Pagamento", "Remuneração"],
    synonyms: ["Salary", "Salário", "Renda", "Income"]
  }
};

async function suggestCategory(
  userId: string,
  title: string,
  categories: any[]
): Promise<string | null> {
  const lowercaseTitle = title.toLowerCase();

  // 1. Precise keyword matching
  for (const [concept, data] of Object.entries(KEYWORD_MAP)) {
    // Check if any keyword matches the title
    if (data.keywords.some((kw) => lowercaseTitle.includes(kw.toLowerCase()))) {
      // Find a category that matches either the concept name or any of its synonyms
      const possibleNames = [concept, ...data.synonyms].map(s => s.toLowerCase());
      const match = categories.find((c) => 
        possibleNames.some(pn => c.name.toLowerCase().includes(pn) || pn.includes(c.name.toLowerCase()))
      );
      if (match) return match.id;
    }
  }

  // 2. Direct name matching with existing categories
  const directMatch = categories.find(
    (c) => lowercaseTitle.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lowercaseTitle)
  );
  if (directMatch) return directMatch.id;

  // 3. History matching (find most frequent category for this title in the past)
  const history = await prisma.transaction.findFirst({
    where: { userId, title: { contains: title, mode: 'insensitive' } },
    orderBy: { createdAt: "desc" },
    select: { categoryId: true },
  });

  return history?.categoryId || null;
}

// --- 5. Import OFX ---
export async function importOFX(formData: FormData): Promise<ActionResponse> {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch {
    return { success: false, message: "ログインが必要です。" };
  }

  const file = formData.get("file") as File;
  const walletId = formData.get("walletId") as string;

  if (!file || !walletId) {
    return { success: false, message: "ファイルとウォレットを選択してください。" };
  }

  const tempFile = path.join(os.tmpdir(), `upload-${Date.now()}-${file.name}`);
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempFile, buffer);

    const pythonPath = "python3";
    const scriptPath = path.join(process.cwd(), "scripts", "parse_ofx.py");
    
    // Execute python script
    const result = execSync(`${pythonPath} "${scriptPath}" "${tempFile}"`).toString();
    const transactions = JSON.parse(result);

    if (transactions.error) {
      return { success: false, message: transactions.error };
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { success: false, message: "取引データが見つかりませんでした。" };
    }

    // Fetch categories once for matching
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
    });

    // Process transactions in a DB transaction
    await prisma.$transaction(async (tx) => {
      for (const t of transactions) {
        const amount = Math.abs(t.amount);
        const isIncome = t.amount > 0;
        const title = t.title || t.payee || t.memo || "OFX Import";
        
        // Try to suggest a category
        const suggestedCategoryId = await suggestCategory(user.id, title, categories);

        // Create transaction
        await tx.transaction.create({
          data: {
            title: title,
            amount: amount,
            date: new Date(t.date),
            userId: user.id,
            walletId: walletId,
            categoryId: suggestedCategoryId,
          },
        });

        // Update balance
        const change = isIncome ? amount : -amount;
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: change } },
        });
      }
    });

    revalidatePath("/transactions");
    revalidatePath("/wallets");
    revalidateTag(`wallets-${user.id}`, "default");
    revalidateTag(`dashboard-${user.id}`, "default");
    return { success: true, message: `${transactions.length}件の取引をインポートしました。` };

  } catch (error: any) {
    console.error("IMPORT ERROR:", error);
    return { success: false, message: `インポートに失敗しました: ${error.message}` };
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}
