import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: Inbox,
  },
  {
    title: "Wallets",
    url: "/wallets",
    icon: Calendar,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: Calendar,
  },
  {
    title: "Goals",
    url: "/goals",
    icon: Calendar,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
