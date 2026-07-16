"use client";

import { usePathname } from "next/navigation";

import { navigationItems } from "@/config/navigation.config";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
  children: React.ReactNode;
};

function getPageTitle(pathname: string): string {
  const currentItem = navigationItems.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
  return currentItem?.label ?? "Hospital Workspace";
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar pageTitle={getPageTitle(pathname)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
