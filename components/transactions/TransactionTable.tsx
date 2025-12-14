"use client";

import DataTable from "../data-table/DataTable";
import { Transactions } from "./types";
import { columns } from "./Columns";
import { useRouter } from "next/navigation";

type Props = {
  data: Transactions[];
};

const TransactionTable = ({ data }: Props) => {
  const router = useRouter();

  return (
    <div>
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
