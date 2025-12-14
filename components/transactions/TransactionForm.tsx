"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

const TransactionForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <form className="space-y-4">
      <Input placeholder="Title" />
      <Input placeholder="Amount" type="number" />
      <Input type="date" />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default TransactionForm;
