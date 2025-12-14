import { redirect } from "next/navigation";

export async function createTransaction(formData: FormData) {
  const title = formData.get("title");
  const amount = formData.get("amount");
  const date = formData.get("date");

  console.log("CREATE", { title, amount, date });
  redirect("/transactions");
}

export async function updateTransaction(id: string, formData: FormData) {
  const title = formData.get("title");
  const amount = formData.get("amount");
  const date = formData.get("date");

  console.log("UPDATE", id, { title, amount, date });
  redirect("/transactions");
}
