import {
  Bell,
  CalendarSync,
  Coins,
  Goal,
  Home,
  PieChart,
  Scroll,
  Settings,
  SettingsIcon,
  Wallet,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: PieChart,
  },
  {
    title: "Wallets",
    url: "/wallets",
    icon: Wallet,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: Coins,
  },
  {
    title: "Recurring Bills",
    url: "/recurring",
    icon: CalendarSync,
  },
  {
    title: "Goals",
    url: "/goals",
    icon: Goal,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: Scroll,
  },
];

export const sidebarFooter = [
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
];
