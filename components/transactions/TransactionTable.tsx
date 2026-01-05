"use client";

import DataTable from "../data-table/DataTable";
import { columns } from "./Columns";
import { useRouter, useSearchParams } from "next/navigation";
import { Transaction } from "@/lib/generated/prisma";
import { ReactNode } from "react";

const TransactionTable = ({
  data,
  pagination,
}: {
  data: Transaction[];
  pagination?: ReactNode;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
