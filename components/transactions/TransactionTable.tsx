import DataTable from "../data-table/DataTable";
import { Transactions } from "./types";
import { columns } from "./Columns";

const data: Transactions[] = [
  {
    id: "1",
    name: "Coffee",
    amount: 4.5,
    category: "Food",
    date: "2024-01-10",
  },
  {
    id: "2",
    name: "Uber",
    amount: 15.2,
    category: "Transport",
    date: "2024-01-11",
  },
  {
    id: "3",
    name: "Supermarket",
    amount: 15.2,
    category: "Food",
    date: "2024-01-11",
  },
  {
    id: "4",
    name: "Movie Ticket",
    amount: 15.2,
    category: "Entertainment",
    date: "2024-01-11",
  },
];

const TransactionTable = () => {
  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default TransactionTable;
