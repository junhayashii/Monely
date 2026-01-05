"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ReactNode } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  pagination?: ReactNode;
}

function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  pagination,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)] md:max-h-[calc(100vh-20rem)]">
        <table className="w-full text-left">
          <thead className="sticky top-0 z-10 bg-white dark:bg-slate-950">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`transition-colors ${
                    onRowClick
                      ? "cursor-pointer hover:bg-sky-50/40 dark:hover:bg-sky-900/10"
                      : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-8 py-6">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-300">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-500 text-base font-bold">
                        No transactions found
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Try adjusting your filters or search terms.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800">
          {pagination}
        </div>
      )}
    </div>
  );
}
export default DataTable;
