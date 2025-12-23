"use client";

import DataTable from "../data-table/DataTable";
import { columns } from "./Columns";
import { useRouter } from "next/navigation";
import { Transaction } from "@/lib/generated/prisma";

const TransactionTable = ({ data }: { data: Transaction[] }) => {
  const router = useRouter();

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(data) => {
          router.push(`?mode=edit&id=${data.id}`);
        }}
      />
    </div>
  );
};

export default TransactionTable;
