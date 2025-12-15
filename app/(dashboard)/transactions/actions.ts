"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createTransaction(formData: FormData) {
  await prisma.transaction.create({
    data: {
      title: String(formData.get("title")),
      amount: Number(formData.get("amount")),
      date: new Date(String(formData.get("date"))),
    },
  });
  redirect("/transactions");
}

export async function updateTransaction(id: string, formData: FormData) {
  await prisma.transaction.update({
    where: { id },
    data: {
      title: String(formData.get("title")),
      amount: Number(formData.get("amount")),
      date: new Date(String(formData.get("date"))),
    },
  });
  redirect("/transactions");
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({
    where: { id },
  });
  redirect("/transactions");
}
