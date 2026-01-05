"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { sidebarFooter, sidebarItems } from "./sidebar-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
} from "lucide-react";

import logo from "@/public/logo.png";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type AppSidebarProps = {
  unreadNotificationCount?: number;
};

const AppSidebar = ({ unreadNotificationCount = 0 }: AppSidebarProps) => {
  const pathname = usePathname();
  const { state } = useSidebar(); // 'expanded' | 'collapsed'
  const isCollapsed = state === "collapsed";

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/50 dark:border-slate-800/50 glass-card backdrop-blur-xl"
    >
      {/* 1. Sidebar Header (Logo Section) */}
      <SidebarHeader className="py-4 relative group/header min-h-[64px] flex items-center justify-center">
        <div
          className={`flex items-center w-full transition-all duration-300 ${
            isCollapsed ? "justify-center" : "justify-between px-2"
          }`}
        >
          {/* ロゴエリア */}
          <div className="flex items-center gap-2">
            <div
              className={`transition-all duration-200 ${
                isCollapsed ? "group-hover/header:opacity-0" : "opacity-100"
              }`}
            >
              <Image
                src={logo}
                width={32}
                height={32}
                alt="Logo"
                className="shrink-0"
              />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-extrabold tracking-tight gradient-text-sky truncate">
                Cashly
              </h1>
            )}
          </div>

          {/* SidebarTrigger のカスタマイズ */}
          <div
            className={
              isCollapsed
                ? "absolute inset-0 flex items-center justify-center opacity-0 group-hover/header:opacity-100 transition-opacity"
                : "group-hover/header:opacity-100 transition-opacity"
            }
          >
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Sidebar Content (Search & Nav) */}
      <SidebarContent className="px-3 py-2">
        {/* Navigation Items */}
        <SidebarMenu className="space-y-1">
          {sidebarItems.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`
                    flex items-center gap-3 p-3 h-11 rounded-2xl transition-lumina
                    ${
                      active
                        ? "bg-sky-500 text-white shadow-md shadow-sky-200 dark:shadow-none font-semibold"
                        : "text-slate-500 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400"
                    }
                  `}
                >
                  <Link href={item.url}>
                    <item.icon
                      className={`w-5 h-5 shrink-0 ${
                        active ? "text-white" : ""
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="text-sm tracking-wide">
                        {item.title}
                      </span>
                    )}
                    {active && !isCollapsed && (
                      <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* 3. Sidebar Footer (User & Settings) */}
      <SidebarFooter className="p-3 mt-auto border-t border-slate-200/50 dark:border-slate-800/50">
        <SidebarMenu className="space-y-1">
          {sidebarFooter.map((item) => {
            const active = isActive(item.url);
            const isNotifications = item.title === "Notifications";
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`
                    flex items-center gap-3 p-3 h-11 rounded-2xl transition-lumina
                    ${
                      active
                        ? "bg-sky-500 text-white shadow-md shadow-sky-200 dark:shadow-none font-semibold"
                        : "text-slate-500 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400"
                    }
                  `}
                >
                  <Link href={item.url} className="flex items-center w-full">
                    <item.icon
                      className={`w-5 h-5 shrink-0 ${
                        active ? "text-white" : ""
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="text-sm tracking-wide">
                        {item.title}
                      </span>
                    )}
                    {isNotifications &&
                      unreadNotificationCount > 0 &&
                      !isCollapsed && (
                        <Badge
                          variant="destructive"
                          className="ml-auto text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center"
                        >
                          {unreadNotificationCount > 99
                            ? "99+"
                            : unreadNotificationCount}
                        </Badge>
                      )}
                    {isNotifications &&
                      unreadNotificationCount > 0 &&
                      isCollapsed && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 text-[8px] px-1 min-w-[16px] h-4 flex items-center justify-center"
                        >
                          {unreadNotificationCount > 99
                            ? "99+"
                            : unreadNotificationCount}
                        </Badge>
                      )}
                    {active && !isCollapsed && (
                      <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
