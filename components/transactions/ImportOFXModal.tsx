"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import AddEditModal from "@/components/AddEditModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Wallet } from "@/lib/generated/prisma";
import { importOFX } from "@/app/(dashboard)/transactions/actions";

type Props = {
  wallets: Wallet[];
};

const ImportOFXModal = ({ wallets }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [walletId, setWalletId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const mode = searchParams.get("mode");
  const isOpen = mode === "import";

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    router.push(`?${params.toString()}`);
    setFile(null);
    setWalletId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !walletId) {
      toast.error("ファイルとウォレットを選択してください。");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("walletId", walletId);

    try {
      const res = await importOFX(formData);
      if (res.success) {
        toast.success(res.message);
        close();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("インポート中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AddEditModal
      title="OFX Import"
      description="Select an OFX file and the target wallet to import transactions."
      open={isOpen}
      onOpenChange={close}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="ofx-file">File (OFX or CSV)</Label>
          <Input 
            id="ofx-file"
            type="file" 
            accept=".ofx,.qfx,.csv" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wallet">Target Wallet</Label>
          <Select onValueChange={setWalletId} value={walletId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            Transactions will be imported into this wallet. Be careful of duplicates.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !file || !walletId} className="bg-sky-600 hover:bg-sky-700 text-white">
            {loading ? "Importing..." : "Import Transactions"}
          </Button>
        </div>
      </form>
    </AddEditModal>
  );
};

export default ImportOFXModal;
