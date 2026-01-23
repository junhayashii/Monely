# Monely

Monely is a modern, full-stack personal finance management application designed to help users track their spending, manage budgets, and achieve financial goals with ease. Built with the latest web technologies, it provides a seamless and intuitive experience for personal accounting.

## ✨ Features

- **Dashboard**: A comprehensive overview of your financial health, including balances, recent activities, and key metrics.
- **Transaction Management**: Detailed tracking of income and expenses with support for categorization and payee cleanup.
- **Wallet & Account Tracking**: Manage multiple wallets and bank accounts in one place.
- **Budgeting**: Set and monitor monthly budgets for different categories to stay on top of your spending.
- **Financial Goals**: Define and track progress toward your savings goals.
- **Recurring Transactions**: Manage subscriptions and recurring payments automatically.
- **Visual Reports**: Gain insights into your financial habits with dynamic charts and analytics powered by Recharts.
- **OFX Import**: Easily import bank statements with automated categorization and data cleaning.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **State Management & Tables**: [TanStack Table](https://tanstack.com/table)
- **Forms & Validation**: [Zod](https://zod.dev/)

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm, yarn, pnpm, or bun
- A PostgreSQL database (Supabase recommended)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/monely.git
    cd monely
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your configuration:

    ```env
    DATABASE_URL="your-postgresql-url"
    NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

4.  **Database Setup:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## 📖 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Generates Prisma client and builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
