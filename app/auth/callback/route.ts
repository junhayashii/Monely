import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    // 認可コードをセッション（Cookie）に交換
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 成功したらダッシュボードへ（メッセージ付き）
      return NextResponse.redirect(`${origin}${next}?auth=success`);
    }
  }

  // 失敗した場合はログイン画面へ
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
