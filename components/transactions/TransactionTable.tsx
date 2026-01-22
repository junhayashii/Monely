"use client";

import DataTable from "../data-table/DataTable";
import { useColumns } from "./Columns";
import { useRouter, useSearchParams } from "next/navigation";
import { Transaction } from "@/lib/generated/prisma";
import { ReactNode } from "react";

/**
 * TransactionTable - A client component that wraps the generic DataTable.
 * 
 * It manages:
 * 1. Column definitions (via useColumns hook).
 * 2. Row individual interactions (e.g., clicking a row to edit).
 * 3. Passing the data and pagination UI to the display layer.
 */
const TransactionTable = ({
  data,
  pagination,
}: {
  data: Transaction[];
  pagination?: ReactNode;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const columns = useColumns();

  /**
   * handleRowClick
   * Navigates to the edit mode for a specific transaction by 
   * appending ?mode=edit&id=... to the current URL.
   * This approach preserves existing filters (month, search, etc.) in the URL.
   */
  const handleRowClick = (transaction: Transaction) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "edit");
    params.set("id", transaction.id);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
    </div>
  );
};

export default TransactionTable;
