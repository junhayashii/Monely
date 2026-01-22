import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import TransactionTable from "./TransactionTable";
import TransactionPagination from "./TransactionPagination";
import { getCachedCategories, getCachedWallets } from "@/lib/data-fetching";
import TransactionModalController from "./TransactionModalController";

const PAGE_SIZE = 10;

interface TransactionListProps {
  userId: string;
  searchParams: {
    q?: string;
    month?: string;
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    walletId?: string;
    page?: string;
  };
}

/**
 * TransactionList - A Server Component that fetches and displays transactions.
 * 
 * This component is responsible for:
 * 1. Consuming searchParams to build a Prisma 'where' clause.
 * 2. Calculating pagination (skip/take).
 * 3. Fetching transactions, total count, and metadata (categories/wallets) in parallel.
 * 4. Rendering the TransactionTable and TransactionModalController.
 */
export default async function TransactionList({
  userId,
  searchParams,
}: TransactionListProps) {
  const { q, month, type, categoryId, walletId, page } = searchParams;
  
  // PAGINATION SETUP: 
  // Standard 10 items per page. We default to page 1 if not specified.
  const currentPage = Number(page) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  // QUERY BUILDING:
  // We construct the Prisma 'where' object dynamically based on user input.
  const where: Prisma.TransactionWhereInput = {
    userId,
  };

  // 1. Text Search: Matches the transaction title (case-insensitive)
  if (q?.trim()) {
    where.title = {
      contains: q.trim(),
      mode: "insensitive",
    };
  }

  // 2. Date Filter: Filters by the selected month using date-fns
  if (month) {
    const referenceDate = parseISO(`${month}-01`);
    where.date = {
      gte: startOfMonth(referenceDate),
      lte: endOfMonth(referenceDate),
    };
  }

  // 3. Category Type: Income vs Expense
  if (type) {
    where.category = { type: type };
  }

  // 4. Specific Category
  if (categoryId) {
    where.categoryId = categoryId;
  }

  // 5. Specific Wallet
  if (walletId) {
    where.walletId = walletId;
  }

  // DATA FETCHING:
  // We use Promise.all to fetch everything in a single round-trip to the DB.
  // Note: categories and wallets are 'getCached' in lib/data-fetching to minimize redundant DB calls.
  const [transactions, totalCount, categories, wallets] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      // PERFORMANCE TIP: We only select the fields we actually need to display or use in modals.
      select: {
        id: true,
        title: true,
        amount: true,
        date: true,
        categoryId: true,
        walletId: true,
        toWalletId: true,
        category: { select: { name: true, type: true } },
        wallet: { select: { name: true } },
        toWallet: { select: { name: true } },
      },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
    getCachedCategories(userId),
    getCachedWallets(userId),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      {/* 
          Main Table View 
          We pass the transactions data and a pre-rendered pagination component.
      */}
      <TransactionTable
        data={transactions as any}
        pagination={
          totalPages > 1 ? (
            <TransactionPagination
              totalPages={totalPages}
              currentPage={currentPage}
              skip={skip}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
            />
          ) : undefined
        }
      />

      {/* 
          Modal Logic 
          This client component listens to URL changes (mode=edit/delete) 
          and handles showing the correct UI overlay.
      */}
      <TransactionModalController
        transactions={transactions as any}
        categories={categories as any}
        wallets={wallets as any}
      />
    </>
  );
}
