"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface Props {
  authStatus: string | undefined;
}

export function AuthSuccessToast({ authStatus }: Props) {
  useEffect(() => {
    // デバッグ用：ブラウザのコンソール（F12）に何が出ているか確認
    console.log("Auth Status received in component:", authStatus);

    if (authStatus === "success") {
      toast.success("認証に成功しました！", {
        description: "ようこそ Finance App へ！",
      });

      // パラメータを消す（ここが速すぎると消えてしまうので、少し遅らせるか確認）
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [authStatus]);

  return null;
}
