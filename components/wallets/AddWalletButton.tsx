"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

const AddWalletButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("?mode=add")}
      className="gap-2 shadow-sm hover:shadow-md transition-shadow"
    >
      <Plus className="h-4 w-4" />
      Add Wallet
    </Button>
  );
};

export default AddWalletButton;

