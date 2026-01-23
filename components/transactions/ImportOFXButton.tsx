"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";

const ImportOFXButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "import");
    router.push(`?${params.toString()}`);
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="gap-2 shadow-sm hover:shadow-md transition-shadow hidden sm:flex"
    >
      <Upload className="h-4 w-4" />
      Import OFX
    </Button>
  );
};

export default ImportOFXButton;
