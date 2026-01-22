"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const TransactionPagination = ({
  totalPages,
  currentPage,
  skip,
  pageSize,
  totalCount,
}: {
  totalPages: number;
  currentPage: number;
  skip: number;
  pageSize: number;
  totalCount: number;
}) => {
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest">
        Showing{" "}
        <span className="text-slate-900 dark:text-white">{skip + 1}</span> -{" "}
        <span className="text-slate-900 dark:text-white">
          {Math.min(skip + pageSize, totalCount)}
        </span>{" "}
        of <span className="text-slate-900 dark:text-white">{totalCount}</span>
      </p>

      <div className="flex items-center gap-1">
        <Link
          href={createPageURL(currentPage - 1)}
          className={`p-2 rounded-xl transition-all ${
            currentPage === 1
              ? "text-slate-200 cursor-not-allowed pointer-events-none"
              : "text-slate-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-500"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, idx) => {
            if (pageNum === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-10 h-10 flex items-center justify-center text-slate-400"
                >
                  ...
                </span>
              );
            }

            const page = pageNum as number;
            const isActive = currentPage === page;

            return (
              <Link
                key={page}
                href={createPageURL(page)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-200 dark:shadow-none"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {page}
              </Link>
            );
          })}
        </div>

        <Link
          href={createPageURL(currentPage + 1)}
          className={`p-2 rounded-xl transition-all ${
            currentPage >= totalPages
              ? "text-slate-200 cursor-not-allowed pointer-events-none"
              : "text-slate-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-500"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default TransactionPagination;
