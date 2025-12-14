"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const AddTransactionButton = () => {
  const router = useRouter();
  return (
    <div>
      <Button onClick={() => router.push("?mode=add")}>Add Transaction</Button>
    </div>
  );
};

export default AddTransactionButton;
